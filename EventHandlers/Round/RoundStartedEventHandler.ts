export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { RoundStartedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
let cls: { new(): RoundSearchReport } = RoundSearchReport;

@EventsHandler(RoundStartedEvent)
export class RoundStartedEventHandler implements IEventHandler<RoundStartedEvent>
{

    async handle(event: RoundStartedEvent) {

        let exists = await SearchClient.Exists(event.Id, cls)

        if (exists) {
            let round: Partial<RoundSearchReport> = new cls();
            round.Players = event.Players;
            round.Id = event.Id.toString();
            delete round.Lines;

            await SearchClient.Update(round);
        } else {
            let round = new cls();
            round.Players = event.Players;
            round.Id = event.Id.toString();
            delete round.Lines;

            await SearchClient.Put(round);
        }
        return;
    }
}