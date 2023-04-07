import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../../SMERSH/Utilities'
import { Config, ClientBuilder, SmershController } from '../../Framework';
import { CommandBus } from '@nestjs/cqrs';
import { ReceiveChatLinesCommand } from '../../../Commands/Round'
import { Guid } from "guid-typescript";

@Controller()
export class LandingPageController extends SmershController {

    public constructor(protected readonly commandBus: CommandBus) {
        super(commandBus)
    }

    @Get('/')
    public GreetVisitor() {
        return 'great success!'
    }

    @Get('/elastic')
    public BuildIndices() {
        const config = process.env;
        return ClientBuilder.Build(config["ELASTIC_URL"])
    }
}