export { }
import { CommandBus, IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { RoundEndedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';

let cls: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(RoundEndedEvent)
export class RoundEndedEventHandler implements IEventHandler<RoundEndedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.env.NODE_ENV['PARAMS'])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: RoundEndedEvent) {
        let partial: Partial<RoundSearchReport> = new cls(event.Id, event.MapId);
        partial.Players = event.Players;
        partial.IsActive = false;

        await SearchClient.Update(partial);
        return;
    }
}