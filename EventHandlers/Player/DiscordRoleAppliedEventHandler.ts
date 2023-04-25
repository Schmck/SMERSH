export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { DiscordRoleAppliedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(DiscordRoleAppliedEvent)
export class DiscordRoleAppliedEventHandler implements IEventHandler<DiscordRoleAppliedEvent>
{

    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: DiscordRoleAppliedEvent) {
        let player = new cls(event.Id);
        player.Role = event.Role;
        await SearchClient.Put(player)

        return;
    }
}