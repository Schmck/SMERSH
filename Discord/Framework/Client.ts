import { Client as DiscordClient, ClientOptions } from "discord.js";
import * as Commands from '../Commands'
import * as dotenv from 'dotenv';
import { CommandBus } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { Command } from '../../Commands/Command'



export class Client extends DiscordClient {
    @Inject(CommandBus)
    public readonly commandBus!: CommandBus;

    public constructor(options: ClientOptions) {
        super(options)
        dotenv.config()
        this.login(process.env["DISCORD_TOKEN"])

    }
}