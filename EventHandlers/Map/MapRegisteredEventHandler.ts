export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { MapRegisteredEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { MapSearchReport } from '../../Reports/Entities/map'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
let cls: { new(id: Guid): MapSearchReport } = MapSearchReport;
let rnd: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(MapRegisteredEvent)
export class MapRegisteredEventHandler implements IEventHandler<MapRegisteredEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }

    async handle(event: MapRegisteredEvent) {

        let map = new cls(event.Id);
        map.MapName = event.Name;
        map.TimeLimit = event.TimeLimit;

        await SearchClient.Put(map);
        return;
    }
}