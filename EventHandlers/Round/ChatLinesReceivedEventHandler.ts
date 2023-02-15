export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLinesReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
let cls: { new(): RoundSearchReport } = RoundSearchReport;

@EventsHandler(ChatLinesReceivedEvent)
export class ChatLinesReceivedEventHandler implements IEventHandler<ChatLinesReceivedEvent>
{
   
    async handle(event: ChatLinesReceivedEvent) {

        let exists = await SearchClient.Exists(event.Id, cls)

        if (exists) {
            let round: Partial<RoundSearchReport> = new cls()
            round.Lines = event.Lines;
            round.Id = event.Id.toString();
            await SearchClient.Update(round);
        } else {
            let round = new cls()
            round.Lines = event.Lines;
            round.Id = event.Id.toString();
            await SearchClient.Put(round)
        }
        return;
    }
}