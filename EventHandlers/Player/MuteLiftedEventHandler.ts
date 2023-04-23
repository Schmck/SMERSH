export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PolicyQuery } from '../../Services/WebAdmin/Queries/PolicyQuery'
import { MuteLiftedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { Client } from '../../Discord/Framework';
import { TextChannel } from 'discord.js';
let cls: { new(id: Guid): PolicySearchReport } = PolicySearchReport;

@EventsHandler(MuteLiftedEvent)
export class MuteLiftedEventHandler implements IEventHandler<MuteLiftedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: MuteLiftedEvent) {
        let policy: PolicySearchReport = await SearchClient.Get(event.Id, PolicySearchReport)
        const channel = await this.client.channels.fetch(policy.ChannelId) as TextChannel

        policy.IsActive = false;

        await SearchClient.Update(policy);
        await channel.send(`mute lifted from ${policy.Name}, originally banned on ${policy.BanDate.toString().split(' GMT')[0]} for ${policy.Reason}`)

        return;
    }
}