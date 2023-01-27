export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLineReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'


@EventsHandler(ChatLineReceivedEvent)
export class ChatLineReceivedEventHandler implements
    IEventHandler<ChatLineReceivedEvent>
{
   
    async handle(event: ChatLineReceivedEvent) {
        const round = await SearchClient.Get<RoundSearchReport>(event.Id);
        round.Lines = [...round.Lines, event.Line]

        await SearchClient.Update(round);
    }
}