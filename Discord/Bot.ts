import { Client, Listeners } from './Framework'
import { CommandBus } from '@nestjs/cqrs'

export class Bot {

    public constructor(commandBus: CommandBus) {
        this.startup(commandBus)
        this.registerListeners()
    }

    public client: Client;

    private async startup(commandBus: CommandBus) {
        this.client = new Client({
            intents: []
        }, commandBus)

    }

    private async registerListeners() {
        Listeners.onReady(this.client);
        Listeners.onInteractionCreate(this.client)
    }
}


