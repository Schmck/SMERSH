import { Client as DiscordClient, ClientOptions } from "discord.js";
import * as Commands from '../Commands'
import * as dotenv from 'dotenv';



export class Client extends DiscordClient {
    public constructor(options: ClientOptions) {
        super(options)
        dotenv.config()
        this.login(process.env["DISCORD_TOKEN"])

    }
}