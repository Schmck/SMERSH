export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLinesReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round';
import { Guid } from 'guid-typescript';
import { CommandBus } from '@nestjs/cqrs';
let cls: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(ChatLinesReceivedEvent)
export class ChatLinesReceivedEventHandler implements IEventHandler<ChatLinesReceivedEvent>
{
    public constructor(protected readonly commandBus: CommandBus) {
    }
   
    async handle(event: ChatLinesReceivedEvent) {

        let partial: Partial<RoundSearchReport> = new cls(event.Id);
        partial.Lines = event.Lines;

        delete partial.MapId;
        delete partial.Players;
        delete partial.IsActive;

        await SearchClient.Update(partial);
        return;
    }
}