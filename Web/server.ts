import { createExpressServer } from 'routing-controllers';
import { WebAdminSession } from '../Services/WebAdmin';
//import { ClientBuilder } from '../Elastic'
import "reflect-metadata";
import { Config, ClientBuilder } from './Framework';
import * as dotenv from 'dotenv';

import 'reflect-metadata';
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
    GetLayoutController,
    PostLayoutController
    } from './Controllers/Layout'

const app = createExpressServer({
    controllers: [
        LandingPageController,

        CurrentStatusController,
        CurrentChatController,

        PlayersController,
        PlayerController,
        CondemnPlayerController,

        GetLayoutController,
        PostLayoutController
        ], 
});

dotenv.config()
const config = process.env;
console.log(config["ELASTIC_URL"])
//ClientBuilder.BuildClient(config["ELASTIC_URL"])

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
app.listen(1337);