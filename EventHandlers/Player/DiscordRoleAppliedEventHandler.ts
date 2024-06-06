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
import { Client, Logger } from '../../Discord/Framework';
import { SteamBot } from '../../SMERSH/Utilities/steam';
import { DiscordRole } from '../../SMERSH/ValueObjects/player';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(DiscordRoleAppliedEvent)
export class DiscordRoleAppliedEventHandler implements IEventHandler<DiscordRoleAppliedEvent>
{

    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = process.env["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)

     this.steam = SteamBot.get();
    }

    public steam: SteamBot;

    async handle(event: DiscordRoleAppliedEvent) {
        let player = new cls(event.Id);
        player.Role = event.Role;
        await SearchClient.Update(player)

        this.steam.sendMessageToFriend(event.Id.toString(), `Congratulations you have been given the ${DiscordRole.fromValue(event.Role).DisplayName} role`)
        return;
    }
}