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
import { Client, Logger } from '../../Discord/Framework';
import { SteamBot } from '../../SMERSH/Utilities/steam';

@EventsHandler(BanLiftedEvent)
export class BanLiftedEventHandler implements IEventHandler<BanLiftedEvent>
{
    public client: Client;
    public constructor(protected readonly commandBus: CommandBus) {
        const token = JSON.parse(process.env.NODE_ENV['PARAMS'])["DISCORD_TOKEN"]
        this.client = new Client(token, {
            intents: []
        }, commandBus)
        this.steam = SteamBot.get();
    }
    public steam: SteamBot;

    async handle(event: BanLiftedEvent) {
        let policy: PolicySearchReport = await SearchClient.Get(event.Id, PolicySearchReport)
        
        policy.IsActive = false;        

        await SearchClient.Update(policy);

        this.client.on('ready', async (client) => {
            const channel = await client.channels.fetch(policy.ChannelId) as TextChannel;
            if (channel) {
                await channel.send(`ban lifted from ${policy.Name}, originally banned for ${policy.Reason} on ${new Date(policy.BanDate).toString().split(' GMT')[0]}`)
            }

            const message = `your ban has been lifted, originally banned for ${policy.Reason} on ${new Date(policy.BanDate).toString().split(' GMT')[0]}`

            Logger.append(`${policy.Name}s ban has been lifted, originally banned for ${policy.Reason} on ${new Date(policy.BanDate).toString().split(' GMT')[0]}`)


            await this.steam.sendMessageToFriend(event.PlayerId, `/pre this is an automated message integrated with ChatGPT`)
            await this.steam.sendMessageToFriend(event.PlayerId, message)

        });

        return;
    }
}