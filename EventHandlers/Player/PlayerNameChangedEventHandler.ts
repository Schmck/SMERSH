export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerNameChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client, Logger } from '../../Discord/Framework';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(PlayerNameChangedEvent)
export class PlayerNameChangedEventHandler implements IEventHandler<PlayerNameChangedEvent>
{

    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.env)["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: PlayerNameChangedEvent) {
        let player = new cls(event.Id);
        player.Name = event.Name;
        await SearchClient.Update(player)

        Logger.append(`[${(event.Id as any as string).slice(9)}] Name change detected: ${event.PrevName} -> ${event.Name}`)

        return;
    }
}