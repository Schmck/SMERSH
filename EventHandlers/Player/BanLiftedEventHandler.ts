export { }
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PolicyQuery } from '../../Services/WebAdmin/Queries/PolicyQuery'
import { BanLiftedEvent } from '../../Events'
import { SearchClient } from '../../Elastic/app'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { CommandBus } from '@nestjs/cqrs';
import { Guid } from 'guid-typescript';
import { TextChannel } from 'discord.js';
import { Client } from '../../Discord/Framework';

@EventsHandler(BanLiftedEvent)
export class BanLiftedEventHandler implements IEventHandler<BanLiftedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.argv[process.argv.length - 1])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
    }

    async handle(event: BanLiftedEvent) {
        let policy: PolicySearchReport = await SearchClient.Get(event.Id, PolicySearchReport)
        
        policy.IsActive = false;        

        await SearchClient.Update(policy);

        this.client.on('ready', async (client) => {
            const channel = await client.channels.fetch(policy.ChannelId) as TextChannel;
            if (channel) {
                await channel.send(`ban lifted from ${policy.Name}, originally banned for ${policy.Reason} on ${new Date(policy.BanDate).toString().split(' GMT')[0]}`)
  }
        });

        return;
    }
}