import { createExpressServer } from 'routing-controllers';
import { CurrentStatusController } from './Controllers/Current';
import { Config } from './Framework';
import * as dotenv from 'dotenv';

const app = createExpressServer({
    controllers: [
        CurrentStatusController
        ], 
});

dotenv.config()
const config = Config.env;
console.log(config)
app.listen(3000);