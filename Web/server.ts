import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher, BanWatcher } from '../Watcher'
import { CommandBus } from '@nestjs/cqrs'
import { Bot } from '../Discord/Bot'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const config = process.env;


async function start(port: number) {

    const app = await NestFactory.create(AppModule)
    await app.listen(port), () => { console.log('cqrs module running on port 1337')}

    await ClientBuilder.Build(config["ELASTIC_URL"])

    WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])

    const bus = app.get(CommandBus);
    const bot : Bot = new Bot(bus);


    const chat = new ChatWatcher(bus, bot.client);
    const round = new RoundWatcher(bus, bot.client);
    const ban = new BanWatcher(bus, bot.client);


    chat.Watch();
    round.Watch();
    ban.Watch();


}

process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});
start(1337);