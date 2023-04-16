import { Client as DiscordClient, ClientOptions } from "discord.js";
import * as Commands from '../Commands'
import * as dotenv from 'dotenv';
import { CommandBus } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { Command } from '../../Commands/Command'
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";

dotenv.config()
const config = process.env;

export class Client extends DiscordClient {

    public readonly commandBus: CommandBus;

    public constructor(token: string, options: ClientOptions, commandBus: CommandBus) {
        super(options)
        this.commandBus = commandBus;
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)

        this.login(token)
    }

    public log: FileLogger;
}