import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config, ClientBuilder, Api } from './Framework';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher, PolicyWatcher, LayoutWatcher } from '../Watcher'
import { CommandBus, } from '@nestjs/cqrs'
import { Bot } from '../Discord/Bot'
import * as path from 'path'
import { SteamBot } from '../SMERSH/Utilities/steam';
import { ChatGPT } from '../SMERSH/Utilities/openai';
import { Policy } from './Utils'
import { Logger } from '../Discord/Framework';
import { TextChannel, Message } from 'discord.js';
import * as CryptoJS from 'crypto-js';
import { evt } from '../Services/evt';
import fs from 'fs';



dotenv.config()
const args = process.argv;


async function start(baseUrl: string, elasticUrl, authcred: string, discordToken: string, logChannelId: string, dashboardChannelId: string, chatlogChannelId: string, scoreboardId: string, chatLogId: string, steamToken: string, steamAccountName: string, steamPassword: string, ChatGPTApiKey: string, port: number) {
    const app = await NestFactory.create(AppModule)
    const session = await WebAdminSession.set(baseUrl, authcred);
    await app.listen(port, () => { console.log(`cqrs module running on port ${port}`) })

    await ClientBuilder.Build(elasticUrl)
    await ChatGPT.set(ChatGPTApiKey)
    await SteamBot.set(steamAccountName, steamPassword);
    Api.axios(session.CookieJar)

    const bus = app.get(CommandBus);
    const discord: Bot = new Bot(discordToken, bus);
    const steam: SteamBot = SteamBot.get();


    const chat = new ChatWatcher(bus, discord.client, steamToken);
    const round = new RoundWatcher(bus, discord.client, steamToken);
    const policy = new PolicyWatcher(bus, discord.client, steamToken);
    const layout = new LayoutWatcher(bus, discord.client, steamToken);


    discord.client.once('ready', async (client: any) => { 
        const logChannel = await client.channels.fetch(logChannelId) as TextChannel;
        const dashboardchannel = await client.channels.fetch(dashboardChannelId) as TextChannel;
        const chatlogchannel = await client.channels.fetch(chatlogChannelId) as TextChannel;
        const scoreboard = scoreboardId !== '' ? await dashboardchannel.messages.fetch(scoreboardId) : null;
        const chatlog = chatLogId !== '' ? await dashboardchannel.messages.fetch(chatLogId) : null;

         const logger = await Logger.set(discord.client, logChannel, dashboardchannel, chatlogchannel, chatlog, scoreboard);

            logger.publish();
            logger.publishDashboard();
            chat.Watch();
            round.Watch();
            policy.Watch();
            layout.Watch();
    })

    if (Object.keys(steam.steam.myFriends).length > 100) {
        console.log(steam.steam.myFriends);
        const reduced = Object.entries(steam.steam.myFriends).reduce((friends, item) => {
            const id = item[0]
            const friend = item[1]

            if (friends.total < 100) {
                return { ...friends, friends: { ...friends.friends, [id]:friend }, total: friends.total + 1 }
            }
            return friends;

        }, { total: 0, friends: {} })
        steam.steam.myFriends = reduced.friends;
        console.log(steam.steam.myFriends);
    }



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
    const envFilePath = path.join(__dirname, '.env');
    const webAdmin = evt.set(evt.parseEnvFile(envFilePath));
    const authcred = Buffer.from(`${webAdmin.WEBADMIN_USERNAME + ':' + CryptoJS.SHA1(webAdmin.WEBADMIN_PASSWORD).toString(CryptoJS.enc.Hex)}`).toString('base64') ;
    start(
        webAdmin.BASE_URL.toString(),
        webAdmin.ELASTIC_URL.toString(),
        authcred.toString(),
        webAdmin.DISCORD_TOKEN.toString(),
        webAdmin.LOG_CHANNEL_ID.toString(),
        webAdmin.DASHBOARD_CHANNEL_ID.toString(),
        webAdmin.CHATLOG_CHANNEL_ID.toString(),
        webAdmin.SCOREBOARD_ID.toString(),
        webAdmin.CHATLOG_ID.toString(),
        webAdmin.STEAM_TOKEN.toString(),
        webAdmin.STEAM_ACCOUNT_NAME.toString(),
        webAdmin.STEAM_ACCOUNT_PASSWORD.toString(),
        webAdmin.CHATGPT_API_KEY.toString(),
        parseInt(webAdmin.PORT.toString())
    )
}

boot();


process.on('uncaughtException', (err : Error) => {
    console.trace(err);
    if (err.message.includes('ECONNRESET')) {
        setTimeout(() => {
            boot();
        }, 10000)
    }
    console.log("Node NOT Exiting...");
});

