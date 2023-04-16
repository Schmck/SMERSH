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

    @Get('/')
    public GreetVisitor() {
        return 'great success!'
    }
}