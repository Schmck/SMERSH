export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLineReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';


@EventsHandler(ChatLineReceivedEvent)
export class ChatLineReceivedEventHandler implements
    IEventHandler<ChatLineReceivedEvent>
{
   
    async handle(event: ChatLineReceivedEvent) {
        const round = await SearchClient.Get<RoundSearchReport>(event.Id, new RoundSearchReport() as unknown as IndexedClass<RoundSearchReport>);
        round.Lines = [...round.Lines, event.Line]

        await SearchClient.Update(round);
    }
}