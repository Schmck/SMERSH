import { createExpressServer } from 'routing-controllers';
import { CurrentStatusController } from './Controllers/Current';

// creates express app, registers all controller routes and returns you express app instance
const app = createExpressServer({
    controllers: [
        CurrentStatusController
        ], 
});

app.listen(3000);