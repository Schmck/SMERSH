export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLinesReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { Guid } from 'guid-typescript';
let cls: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(ChatLinesReceivedEvent)
export class ChatLinesReceivedEventHandler implements IEventHandler<ChatLinesReceivedEvent>
{
   
    async handle(event: ChatLinesReceivedEvent) {

        let partial: Partial<RoundSearchReport> = new cls(event.Id);
        partial.Lines = event.Lines;

        delete partial.MapId;
        delete partial.Players;
        await SearchClient.Update(partial);
        return;
    }
}