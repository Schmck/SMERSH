import { createExpressServer } from 'routing-controllers';
import { WebAdminSession } from '../Services/WebAdmin';
import "reflect-metadata";
import { Config } from './Framework';
import * as dotenv from 'dotenv';

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

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
app.listen(1337);