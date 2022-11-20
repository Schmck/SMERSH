import { createExpressServer } from 'routing-controllers';
import { CurrentStatusController } from './Controllers/Current';
import { CurrentChatController } from './Controllers/Current';
import { WebAdminSession } from '../Services/WebAdmin';
import { Config } from './Framework';
import * as dotenv from 'dotenv';

const app = createExpressServer({
    controllers: [
        CurrentStatusController,
        CurrentChatController
        ], 
});

dotenv.config()
const config = process.env;

WebAdminSession.set(config["BASE_URL"], config["AUTHCRED"])
app.listen(1337);