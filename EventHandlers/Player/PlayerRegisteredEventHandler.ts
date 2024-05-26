export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerRegisteredEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(PlayerRegisteredEvent)
export class PlayerRegisteredEventHandler implements IEventHandler<PlayerRegisteredEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = process.env["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: PlayerRegisteredEvent) {
        let player = new cls(event.Id);
        player.Name = event.Name;
        player.Ip = event.Ip;

        await SearchClient.Put(player);

        return;
    }
}