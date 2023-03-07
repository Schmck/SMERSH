import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { StartRoundCommand, EndRoundCommand, ChangeMapCommand  } from '../../Commands/Round'
import { UpdatePlayerRoundCommand  } from '../../Commands/Round/PlayerRound'
import { RegisterPlayerCommand  } from '../../Commands/Player'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/Map';
import { PlayerSearchReport } from '../../Reports/Entities/player';
import { Enumeration, Role, Team } from '../../SMERSH/ValueObjects';

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args: any[]) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0]['status'];
        let prevMapTime = args[0] && args[0]['mapTime']
        let mapTime = prevStatus && prevStatus.rules && prevStatus.rules.TimeLeft ? parseInt(prevStatus.rules.TimeLeft) : 0

        if (status) { 
            let oldMap = prevStatus && prevStatus.game && prevStatus.game.Map;
            let newMap = status && status.game && status.game['Map']
            const map = newMap && (await SearchClient.Search(MapSearchReport, {
                "query": {
                    "match": {
                        "MapName": newMap,
                    }
                }
            })).shift()
            let roundQuery = {
                "size": 1,
                "sort": [
                    {
                        "Date": {
                            "order": "desc"
                        }
                    }
                ]
            };

            if (map) {
                roundQuery["query"] = {
                        "match": {
                            "MapId": map.Id,
                        }
                    }
            }
            const round = (await SearchClient.Search(RoundSearchReport, roundQuery)).shift()
            const playerIds: string[] = status.players ? status.players.map(player => player.Id) : []
            const timeLimit = status.rules && status.rules['TimeLimit'] ? parseInt(status.rules['TimeLimit']) : 0
            const newMapTime = status.rules && status.rules['TimeLeft'] ? parseInt(status.rules['TimeLeft']) : 0
            const mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();
            const roundId = Guid.create();


            if (oldMap && newMap && oldMap !== newMap) {
                await this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }

            if (round && mapTime && timeLimit === mapTime) {
                 await this.commandBus.execute(new StartRoundCommand(Guid.parse(round.Id), timeLimit, new Date(), playerIds))
            }

            if (round && newMapTime && newMapTime === mapTime && mapTime !== prevMapTime) {
                 await this.commandBus.execute(new EndRoundCommand(Guid.parse(round.Id), new Date(), playerIds))
            }

            if (playerIds.length) {
                for (let playerId of playerIds) {
                    const exists = await SearchClient.Exists(playerId, PlayerSearchReport)
                    const player = status.players.find(player => player.Id === playerId)

                    if (!exists) {
                        if (player && player.Id) {
                            await this.commandBus.execute(new RegisterPlayerCommand(player.Id, player.Playername))
                        }
                    } else if (player && player.Id) {
                        const team = Team.fromValue(parseInt(player.Team))
                        const role = Role.fromDisplayName(player.Role);
                        const id = Guid.parse((roundId.toString().slice(0, 27) + playerId.slice(9)))
                        
                        if (team && role) {
                            await this.commandBus.execute(new UpdatePlayerRoundCommand(id, player.Id, Guid.parse(round.Id), team.Value, role.Value, player.Score, player.Kills, player.Deaths))
                        }
                    }
                }

            }
    }

        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, mapTime })
        }, timeout)
    }
}