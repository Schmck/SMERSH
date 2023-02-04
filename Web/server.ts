import 'stream/web'
import 'reflect-metadata';
import { WebAdminSession } from '../Services/WebAdmin';
//import { ClientBuilder } from '../Elastic'
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './Framework/app.module';
import { SmershModule } from './Framework/smersh.module';



import {
    CurrentStatusController,
    CurrentChatController
} from './Controllers/Current';

import {
    PlayersController,
    PlayerController,
    CondemnPlayerController,
    LandingPageController
} from './Controllers/Admin';

import {

    LayoutController
    } from './Controllers/Layout'


dotenv.config()
const config = process.env;
console.log(config["ELASTIC_URL"])
ClientBuilder.Build(config["ELASTIC_URL"])
//var mappings = ClientBuilder.getMappings()
//console.log(mappings)

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
//app.listen(1337);


async function start(port: number) {

    const app = await NestFactory.create(AppModule)
    app.listen(port), () => console.log('cqrs module running on port 1337')
}


start(1337)
