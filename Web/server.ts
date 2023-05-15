import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher, PolicyWatcher, LayoutWatcher } from '../Watcher'
import { CommandBus, } from '@nestjs/cqrs'
import { Bot } from '../Discord/Bot'
import * as path from 'path'
import { NestApplicationOptions } from '@nestjs/common';
import { SteamBot } from '../SMERSH/Utilities/steam';
import { ChatGPT } from '../SMERSH/Utilities/openai';
import { Policy } from './Utils'
import { Client, Logger } from '../Discord/Framework';
import { TextChannel } from 'discord.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const config = process.env;
const args = process.argv;


async function start(baseUrl: string, elasticUrl, authcred: string, discordToken: string, logChannelId: string, steamToken: string, steamAccountName: string, steamPassword: string, ChatGPTApiKey: string, port: number) {
    await ChatGPT.set(ChatGPTApiKey)
    await SteamBot.set(steamAccountName, steamPassword);

    const app = await NestFactory.create(AppModule)
    await app.listen(port, () => { console.log(`cqrs module running on port ${port}`) })

    await ClientBuilder.Build(elasticUrl)


    WebAdminSession.set(baseUrl, authcred)

    const bus = app.get(CommandBus);
    const discord: Bot = new Bot(discordToken, bus);
    const steam: SteamBot = SteamBot.get();


    const chat = new ChatWatcher(bus, discord.client, steamToken);
    const round = new RoundWatcher(bus, discord.client, steamToken);
    const policy = new PolicyWatcher(bus, discord.client, steamToken);
    const layout = new LayoutWatcher(bus, discord.client, steamToken);


    discord.client.once('ready', async (client: Client) => {
    const channel = await client.channels.fetch(logChannelId) as TextChannel;
    const logger = await Logger.set(discord.client, channel);

        logger.publish();
        chat.Watch();
        round.Watch();
        policy.Watch();
        layout.Watch();
    })
    
    

    steam.steam.on('friendMessage', async (steamID, message) => {
        const policies = (await Policy.getPolicies(steamID.getSteamID64())).map(policy => {
            let duration
            if (policy.BanDate && policy.UnbanDate) {
                duration = Policy.getDurationString(new Date(policy.BanDate), new Date(policy.UnbanDate))
            }
            return { action: policy.Action, reason: policy.Reason, duration, active: policy.IsActive }
        })
        steam.respondToFriend(steamID, policies, message)
    });

}

function boot() {
    const webAdmin = JSON.parse(args[args.length - 1]) as Record<string, string | number>;
    start(webAdmin.BASE_URL.toString(), webAdmin.ELASTIC_URL.toString(), webAdmin.AUTHCRED.toString(), webAdmin.DISCORD_TOKEN.toString(), webAdmin.LOG_CHANNEL_ID.toString(), webAdmin.STEAM_TOKEN.toString(), webAdmin.STEAM_ACCOUNT_NAME.toString(), webAdmin.STEAM_ACCOUNT_PASSWORD.toString(), webAdmin.CHATGPT_API_KEY.toString(), parseInt(webAdmin.PORT.toString()))
}

boot();


process.on('uncaughtException', function (err) {
    console.trace(err);
    console.log("Node NOT Exiting...");
});