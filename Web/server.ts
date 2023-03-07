import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher, PlayerWatcher } from '../Watcher'
import { CommandBus } from '@nestjs/cqrs'

dotenv.config()
const config = process.env;
//SearchClient.ResolveQueue(1000)
//var mappings = ClientBuilder.getMappings()
//console.log(mappings)

//app.listen(1337);


async function start(port: number) {

    const app = await NestFactory.create(AppModule)
    await app.listen(port), () => { console.log('cqrs module running on port 1337')}
    await ClientBuilder.Build(config["ELASTIC_URL"])
    WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])

    const bus = app.get(CommandBus);
    const chat = new ChatWatcher(bus);
    const round = new RoundWatcher(bus);
    const player = new PlayerWatcher(bus);

    chat.Watch();
    round.Watch();
    player.Watch();
 
}


start(1337);