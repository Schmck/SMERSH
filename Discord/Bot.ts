import { Client, Listeners } from './Framework'

const client = new Client({
    intents: []
})



Listeners.onReady(client);
Listeners.onInteractionCreate(client)



