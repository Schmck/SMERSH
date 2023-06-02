import { Watcher } from '../Watcher'
import { LiftBanCommand, LiftMuteCommand } from '../../Commands/Player'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { PolicySearchReport } from '../../Reports/Entities/policy';
import { Api } from '../../Web/Framework'
import { PlayersRoute, PolicyRoute } from '../../Services/WebAdmin/Routes';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs'
import { PolicyQuery, StatusQuery } from '../../Services/WebAdmin/Queries';
import { Team, Role, Action } from '../../SMERSH/ValueObjects';

export class PolicyWatcher extends Watcher {

    public override async Watch(timeout = 5000, ...args: any[]) {
        const count = await SearchClient.Count<PolicySearchReport>(PolicySearchReport)
        const status = await StatusQuery.Get();
        const players = status && status.Players ? status.Players: [];
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
        const axios = Api.axios();

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
                                        const config: AxiosRequestConfig =
                                        {
                                            headers: {
                                                "Content-type": "application/x-www-form-urlencoded",
                                                "Cookie": `authcred="${argv["AUTHCRED"]}"`
                                            },
                                        }

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
                    const config: AxiosRequestConfig =
                    {
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded",
                            "Cookie": `authcred="${argv["AUTHCRED"]}"`
                        },
                    }

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
                    const config: AxiosRequestConfig =
                    {
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded",
                            "Cookie": `authcred="${argv["AUTHCRED"]}"`
                        },
                    }

                    const urlencoded = `ajax=1&action=unmutevoice&playerkey=${player.PlayerKey}`
                    const response = await axios.post(url, urlencoded, config);
                    this.log.info(JSON.stringify(response.data));
                }

                await this.commandBus.execute(new LiftMuteCommand(Guid.parse(policy.Id)))
            }

            if (policy.Action === Action.Ban.DisplayName && policy.UnbanDate && new Date(policy.UnbanDate) <= new Date()) {

                const urlencoded = `banid=plainid%3A${policy.PlainId}&action=delete`
                const url = argv["BASE_URL"] + PolicyRoute.DeleteBan.Action

                const config: AxiosRequestConfig =
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        "Cookie": `authcred="${argv["AUTHCRED"]}"`
                    },
                }


                const response = await axios.post(url, urlencoded, config);
                const policies = await PolicyQuery.Get();
                if (policies && policies.length) {
                    if (!policies.includes(policy.PlayerId)) {
                        await this.commandBus.execute(new LiftBanCommand(Guid.parse(policy.Id)))
                    }
                }

                this.log.info(JSON.stringify(response.data));

            }  
        }

        setTimeout(() => {
            this.Watch(timeout)
        }, timeout)
    }
}