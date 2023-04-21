import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { Status } from '../../Services/WebAdmin/Models';
import { StartRoundCommand, EndRoundCommand, ChangeMapCommand  } from '../../Commands/Round'
import { UpdatePlayerRoundCommand  } from '../../Commands/Round/PlayerRound'
import { RegisterPlayerCommand, ChangePlayerNameCommand  } from '../../Commands/Player'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/map';
import { PlayerSearchReport } from '../../Reports/Entities/player';
import { stringify } from 'querystring';
import SteamApi from 'steamapi'
import { hexToDec } from 'hex2dec'
import { Role, Team } from '../../SMERSH/ValueObjects';

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args: Array<{status: Status, mapTime: number}>) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0].status;
        let prevMapTime = args[0] && args[0].mapTime
        let mapTime = (prevStatus && prevStatus.Rules && prevStatus.Rules.TimeLeft) || 0

        if (status) { 
            let oldMap = prevStatus && prevStatus.Game && prevStatus.Game.Map;
            let newMap = status && status.Game && status.Game.Map

            const map = newMap && (await SearchClient.Search(MapSearchReport, {
                "query": {
                    "match": {
                        "MapName": newMap,
                    }
                }
            })).shift()
        

            if (oldMap && newMap && oldMap !== newMap) {
                const mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();
                const roundId = Guid.create();

                await this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }

            if (map) {
                let roundQuery = {
                    "size": 1,
                    "sort": [
                        {
                            "Date": {
                                "order": "desc"
                            }
                        }
                    ],
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "MapId": map.Id,
                                    }
                                },
                                {
                                    "match": {
                                        "IsActive": true
                                    }
                                }
                            ]
                        }
                    }
                };

                const round = (await SearchClient.Search(RoundSearchReport, roundQuery)).shift()
                const playerIds: string[] = status.Players ? status.Players.map(player => player.Id) : []
                const timeLimit = status.Rules && status.Rules.TimeLimit ? status.Rules.TimeLimit : 0
                const newMapTime = status.Rules && status.Rules.TimeLeft ? status.Rules.TimeLeft : 0


                if (round && mapTime && timeLimit && timeLimit === mapTime) {
                    await this.commandBus.execute(new StartRoundCommand(Guid.parse(round.Id), timeLimit, new Date(), playerIds))
                }

                if (round && newMapTime && newMapTime === mapTime && mapTime !== prevMapTime) {
                    await this.commandBus.execute(new EndRoundCommand(Guid.parse(round.Id), new Date(), playerIds));
                }

                if (playerIds.length) {
                    for (let playerId of playerIds) {
                        const exists = await SearchClient.Get(playerId as any as Guid, PlayerSearchReport)
                        const player = status.Players.find(player => player.Id === playerId)
                        
                        

                        if (!exists) {
                            if (player && player.Id) {
                                const decId = hexToDec(player.Id)
                                const playa = decId && await this.steam.getUserSummary(decId)

                                if (player.Playername !== playa.nickname) {
                                    this.log.info(player.Id, player.Playername, playa.nickname, playa.steamID)
                                    await this.commandBus.execute(new RegisterPlayerCommand(player.Id, playa.nickname))

                                } else {
                                    await this.commandBus.execute(new RegisterPlayerCommand(player.Id, player.Playername))

                                }


                            }
                        } else if (player && exists.Name !== player.Playername) {
                            const decId = hexToDec(player.Id)
                            const playa = decId && await this.steam.getUserSummary(decId)

                            if(player.Playername === playa.nickname) {
                                await this.commandBus.execute(new ChangePlayerNameCommand(player.Id, player.Playername))
                            }
                        }

                        if (exists && round && player && player.Id && newMapTime && newMapTime === mapTime && mapTime !== prevMapTime) {
                            const team = Team.fromValue<Team>(player.Team);
                            const role = Role.fromDisplayName<Role>(player.Role);
                            const id = Guid.parse((round.Id.toString().slice(0, 27) + playerId.slice(9)))
                            const attacking = status.Teams[player.Team].Attacking

                            if (team && role) {
                                await this.commandBus.execute(new UpdatePlayerRoundCommand(id, player.Id, Guid.parse(round.Id), team.Value, role.Value, attacking, player.Score, player.Kills, player.Deaths))
                            }
                        }
                    }
                }
            } else {
                const mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();
                const roundId = Guid.create();

                await this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }
            
    }

        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, mapTime })
        }, timeout)
    }
}