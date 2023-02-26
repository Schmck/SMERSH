export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { RoundEndedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { Guid } from 'guid-typescript';
let cls: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(RoundEndedEvent)
export class RoundEndedEventHandler implements IEventHandler<RoundEndedEvent>
{

    async handle(event: RoundEndedEvent) {
        let partial: Partial<RoundSearchReport> = new cls(event.Id, event.MapId);
        partial.Players = event.Players;

        delete partial.Lines;
        await SearchClient.Update(partial);
        return;
    }
}