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
    LandingPageController
} from './Controllers/Admin';

const app = createExpressServer({
    controllers: [
        LandingPageController,

        CurrentStatusController,
        CurrentChatController,

        PlayersController,
        PlayerController
        ], 
});

dotenv.config()
const config = process.env;
console.log(config["ELASTIC_URL"])
ClientBuilder.BuildClient(config["ELASTIC_URL"])

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
app.listen(1337);