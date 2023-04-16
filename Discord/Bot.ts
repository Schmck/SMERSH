import { Client, Listeners } from './Framework'
import { CommandBus } from '@nestjs/cqrs'

export class Bot {

    public constructor(token: string, commandBus: CommandBus) {
        this.startup(token, commandBus)
        this.registerListeners()
    }

    public client: Client;

    private async startup(token: string, commandBus: CommandBus) {
        this.client = new Client(token, {
            intents: []
        }, commandBus)

    }

    private async registerListeners() {
        Listeners.onReady(this.client);
        Listeners.onInteractionCreate(this.client)
    }
}


