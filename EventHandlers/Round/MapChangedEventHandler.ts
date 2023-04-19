export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { MapChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { MapSearchReport } from '../../Reports/Entities/map'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
let cls: { new( id: Guid): MapSearchReport } = MapSearchReport;
let rnd: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(MapChangedEvent)
export class MapChangedEventHandler implements IEventHandler<MapChangedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: MapChangedEvent) {

        const existingMap = (await SearchClient.Search(MapSearchReport, {
            "query": {
                "match": {
                    "MapName": event.MapName,
                }
            }
        })).shift()

        if (!existingMap) {
            let map = new cls(event.MapId);
            map.MapName = event.MapName;

            await SearchClient.Put(map);
        }

        let round = new rnd(event.Id, event.MapId);
        round.IsActive = true;
        await SearchClient.Put(round)

        return;
    }
}