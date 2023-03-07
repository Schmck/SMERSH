import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { StartRoundCommand, EndRoundCommand, ChangeMapCommand } from '../../Commands/Round'
import { UpdatePlayerRoundCommand } from '../../Commands/Round/PlayerRound'
import { RegisterPlayerCommand } from '../../Commands/Player'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/Map';
import { PlayerSearchReport } from '../../Reports/Entities/player';
import { Role, Team } from '../../SMERSH/ValueObjects';

export class PlayerWatcher extends Watcher {

    public override async Watch(timeout = 5000, ...args: any[]) {
        const status = await StatusQuery.Get();

        if (status) {
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
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "MapId": map.Id,
                                }
                            },
                            {
                                "match": {
                                    "isActive": true
                                }
                            }
                        ]
                    }
                }
            }
            const round = (await SearchClient.Search(RoundSearchReport, roundQuery)).shift()
            const playerIds: string[] = status.players ? status.players.map(player => player.Id) : []
          

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
                        const id = Guid.parse((round.Id.toString().slice(0, 27) + playerId.slice(9)))

                        if (team && role) {
                            await this.commandBus.execute(new UpdatePlayerRoundCommand(id, player.Id, Guid.parse(round.Id), team.Value, role.Value, player.Score, player.Kills, player.Deaths))
                        }
                    }
                }
            }
        }

        setTimeout(() => {
            this.Watch(timeout)
        }, timeout)
    }
}