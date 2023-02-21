import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
import { SearchClient } from '../Elastic/'
//import { ClientBuilder } from '../Elastic'
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { ChatWatcher, RoundWatcher } from '../Watcher'
import { CommandBus } from '@nestjs/cqrs'

dotenv.config()
const config = process.env;
console.log(config["ELASTIC_URL"])
ClientBuilder.Build(config["ELASTIC_URL"])
SearchClient.ResolveQueue(1000)
//var mappings = ClientBuilder.getMappings()
//console.log(mappings)

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
//app.listen(1337);


async function start(port: number) {

    const app = await NestFactory.create(AppModule)
    await app.listen(port), () => {
        console.log('cqrs module running on port 1337')
    }
    const bus = app.get(CommandBus);
    const chat = new ChatWatcher(bus);
    const round = new RoundWatcher(bus);

    chat.Watch();
    round.Watch();
 
}


start(1337);