import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { StartRoundCommand, EndRoundCommand, ChangeMapCommand  } from '../../Commands/Round'
import { StatusQuery } from '../../Services/WebAdmin/Queries'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { MapSearchReport } from '../../Reports/Entities/Map';

export class RoundWatcher extends Watcher {

    public override async Watch(timeout = 1000, ...args: any[]) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0]['status'];
        let oldMapTime = args[0] && args[0]['mapTime']
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
            

            const playerIds: string[] = status && status.players ? status.players.map(player => player.Id) : []
            let timeLimit = status && status.rules && status.rules['TimeLimit'] ? parseInt(status.rules['TimeLimit']) : 0
            let newMapTime = status && status.rules && status.rules['TimeLeft'] ? parseInt(status.rules['TimeLeft']) : 0
            let mapId = map && map.Id ? Guid.parse(map.Id) : Guid.create();

            if (round && newMapTime === mapTime && mapTime !== oldMapTime) {
                this.commandBus.execute(new EndRoundCommand(Guid.parse(round.Id), new Date(), playerIds))
            }

            if (oldMap && newMap && oldMap.length !== 0 && oldMap !== newMap) {
                const roundId = Guid.create();
                this.commandBus.execute(new ChangeMapCommand(roundId, mapId, newMap))
            }

            if (round && timeLimit && timeLimit == mapTime) {
                this.commandBus.execute(new StartRoundCommand(Guid.parse(round.Id), timeLimit, new Date(), playerIds))
            }

    }

        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, mapTime })
        }, timeout)
    }
}