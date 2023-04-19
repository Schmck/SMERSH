export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { ChatLinesReceivedEvent } from '../../Events'
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round';
import { Guid } from 'guid-typescript';
import { CommandBus } from '@nestjs/cqrs';
import { Client } from '../../Discord/Framework';
let cls: { new(id?: Guid, mapId?: Guid): RoundSearchReport } = RoundSearchReport;

@EventsHandler(ChatLinesReceivedEvent)
export class ChatLinesReceivedEventHandler implements IEventHandler<ChatLinesReceivedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }
   
    async handle(event: ChatLinesReceivedEvent) {

        let partial: Partial<RoundSearchReport> = new cls(event.Id, event.MapId);
        partial.Lines = event.Lines;

        await SearchClient.Update(partial);
        return;
    }
}