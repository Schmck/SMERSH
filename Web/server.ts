import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher, BanWatcher } from '../Watcher'
import { CommandBus, } from '@nestjs/cqrs'
import { Bot } from '../Discord/Bot'
import * as path from 'path'
import { NestApplicationOptions } from '@nestjs/common';

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const config = process.env;
const args = process.argv;


async function start(baseUrl: string, authcred: string, token: string, port: number) {

    const app = await NestFactory.create(AppModule)
    await app.listen(port, () => { console.log(`cqrs module running on port ${port}`) })

    await ClientBuilder.Build(config["ELASTIC_URL"])

    WebAdminSession.set(baseUrl, authcred)

    const bus = app.get(CommandBus);
    const bot : Bot = new Bot(token, bus);


    const chat = new ChatWatcher(bus, bot.client);
    const round = new RoundWatcher(bus, bot.client);
    const ban = new BanWatcher(bus, bot.client);


    chat.Watch();
    round.Watch();
    ban.Watch();


}


/*
function boot() {
    const webAdmins = JSON.parse(config["WEBADMIN_URLS"]) as Array<Record<string, string | number>>;
    webAdmins.forEach(webAdmin => {
        start(webAdmin.BASE_URL.toString(), webAdmin.AUTHCRED.toString(), webAdmin.DISCORD_TOKEN.toString(), parseInt(webAdmin.PORT.toString()))
    })
}*/
function boot() {
    const webAdmin = JSON.parse(args[args.length - 1]) as Record<string, string | number>;
    start(webAdmin.BASE_URL.toString(), webAdmin.AUTHCRED.toString(), webAdmin.DISCORD_TOKEN.toString(), parseInt(webAdmin.PORT.toString()))
}

boot();

process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});