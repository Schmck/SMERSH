import { createExpressServer } from 'routing-controllers';
import { WebAdminSession } from '../Services/WebAdmin';
import { Config } from './Framework';
import * as dotenv from 'dotenv';

import {
    CurrentStatusController,
    CurrentChatController
} from './Controllers/Current';

import {
    PlayersController,
    LandingPageController
} from './Controllers/Admin';

const app = createExpressServer({
    controllers: [
        LandingPageController,

        CurrentStatusController,
        CurrentChatController,

        PlayersController
        ], 
});

dotenv.config()
const config = process.env;

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
app.listen(1337);