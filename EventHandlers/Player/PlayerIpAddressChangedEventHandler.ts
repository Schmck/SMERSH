export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PlayerIpAddressChangedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { IndexedClass } from '../../SMERSH/Utilities/types';
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client, Logger } from '../../Discord/Framework';
let cls: { new(id: Guid): PlayerSearchReport } = PlayerSearchReport;

@EventsHandler(PlayerIpAddressChangedEvent)
export class PlayerIpAddressChangedEventHandler implements IEventHandler<PlayerIpAddressChangedEvent>
{

    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: PlayerIpAddressChangedEvent) {
        let player = new cls(event.Id);
        player.Ip = event.IpAddress;
        await SearchClient.Update(player)

        if (event.PrevIpAddress) {
            Logger.append(`[${(event.Id as any as string).slice(9)}] Ip Address change detected: ${event.PrevIpAddress} -> ${event.IpAddress}`)

        } else {
            Logger.append(`[${(event.Id as any as string).slice(9)}] Ip Address registered: ${event.IpAddress}`)
        }

        return;
    }
}