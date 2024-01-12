import { Watcher } from '../Watcher'
import { ApplyPolicyCommand, LiftBanCommand, LiftMuteCommand } from '../../Commands/Player'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { PolicySearchReport } from '../../Reports/Entities/policy';
import { Api } from '../../Web/Framework'
import { PlayersRoute } from '../../Services/WebAdmin/Routes';
import { AxiosRequestConfig } from 'axios';
import { PolicyQuery, StatusQuery } from '../../Services/WebAdmin/Queries';
import { Team, Role, Action } from '../../SMERSH/ValueObjects';
import { LayoutSearchReport } from '../../Reports/Entities/layout';
import { UnBanCommand } from '../Commands/UnBanCommand';

export class PolicyWatcher extends Watcher {

    public override async Watch(timeout = 5000, ...args: any[]) {
        const count = await SearchClient.Count<PolicySearchReport>(PolicySearchReport)
        const status = await StatusQuery.Get();
        const players = status && status.Players ? status.Players : [];
        const layout = global.layout && global.layout as LayoutSearchReport
        const policies = await SearchClient.Search(PolicySearchReport, {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "IsActive": true
                            }
                        },
                        {
                            "bool": {
                                "should": [
                                    {
                                        "match": {
                                            "Action": Action.Ban.DisplayName
                                        }
                                    },
                                    {
                                        "match": {
                                            "Action": Action.RoleBan.DisplayName
                                        }
                                    },
                                    {
                                        "match": {
                                            "Action": Action.Mute.DisplayName
                                        }
                                    }
                                ]
                            }
                        }
                    ]

                }
            },
            "size": count.count
            })

        const argv = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "Dnt": 1,
                "Host": argv["BASE_URL"].slice(0, argv["BASE_URL"].indexOf("/ServerAdmin")),
                "Origin": argv["BASE_URL"].slice(7, argv["BASE_URL"].indexOf("/ServerAdmin")),
            },
        }

        const axios = Api.axios();

        if (layout && layout.Ping && layout.Ping !== 0 && players && players.length && players.length > (layout.MinimumPlayerCount * 1.2)) {
            const highPingPlayers = players.filter(player => player.Ping > layout.Ping).sort((pA, pB) => pB.Ping - pA.Ping).slice(0, players.length * 0.1);
            const url = argv["BASE_URL"] + PlayersRoute.CondemnPlayer.Action


            for (let player of highPingPlayers) {
                const urlencoded = `ajax=1&action=kick&playerkey=${player.PlayerKey}`

                this.commandBus.execute(new ApplyPolicyCommand(Guid.create(), player.Id, argv["COMMAND_CHANNEL_ID"], Action.Kick, player.Playername, `Max ping is ${layout.Ping} while we are running the ${layout.Name} layout, our apologies!`, "Admin", new Date()))
                await axios.post(url, urlencoded, config);
           }
        }

        for (let policy of policies) {
            if (policy.Action === Action.RoleBan.DisplayName) {
                const player = players.find(player => player.Id && player.Id.toString() === policy.PlayerId.toString())
                if (player) {
                    const role : Role = Role.fromDisplayName<Role>(player.Role)
                    const team: Team = Team.fromValue<Team>(player.Team)

                    if (role && team) {
                        const side = status.Teams[team.Value].Attacking ? 'attacking' : 'defending'

                        Object.keys(policy.RoleBans).forEach(rol => {
                            const playerRole = parseInt(rol, 10)
                            const roleBan = policy.RoleBans[playerRole]

                            if (role.Value === playerRole && roleBan.Teams && roleBan.Teams.includes(team.Value)) {
                                if ((roleBan.Sides && roleBan.Sides.includes(side)) || (!roleBan.Sides || !roleBan.Sides.length)) {
                                    if (player.Kills || player.Deaths) {
                                        const url = argv["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
                                        const urlencoded = `ajax=1&action=kick&playerkey=${player.PlayerKey}`

                                        axios.post(url, urlencoded, config).then(result => {
                                            this.log.info(JSON.stringify(result.data))
                                        });
                                    }
                                }
                            }
                        })
                    }
                }
               
            }

            if (policy.Action === Action.Mute.DisplayName && policy.UnbanDate && new Date(policy.UnbanDate) >= new Date()) {
                const player = players.find(player => player.Id && player.Id.toString() === policy.PlayerId.toString())
                if (player) {
                    const url = argv["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
                    const urlencoded = `ajax=1&action=mutevoice&playerkey=${player.PlayerKey}`
                    this.log.info(player, urlencoded)
                    axios.post(url, urlencoded, config).then(result => {
                        this.log.info(JSON.stringify(result.data))
                    });
                }
            }

            if (policy.Action === Action.Mute.DisplayName && policy.UnbanDate && new Date(policy.UnbanDate) <= new Date()) {
                const player = players.find(player => player.Id && player.Id.toString() === policy.PlayerId.toString())
                if (player) {
                    const url = argv["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
                    const urlencoded = `ajax=1&action=unmutevoice&playerkey=${player.PlayerKey}`
                    const response = await axios.post(url, urlencoded, config);
                    this.log.info(JSON.stringify(response.data));
                }

                this.commandBus.execute(new LiftMuteCommand(Guid.parse(policy.Id)))
            }

            if (policy.Action === Action.Ban.DisplayName && policy.UnbanDate && new Date(policy.UnbanDate) <= new Date()) {

                await PolicyQuery.Delete(policy.PlayerId);

                this.commandBus.execute(new LiftBanCommand(Guid.parse(policy.Id)))

                this.log.info(`${policy.PlayerId} was unbanned`)
            }  
        }

        setTimeout(() => {
            this.Watch(timeout)
        }, timeout)
    }
}