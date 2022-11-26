import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../../SMERSH/Utilities'

@Controller()
export class LandingPageController {

    public constructor() {
        this.log = new FileLogger('info.log')
    }

    public log : Logger
    @Get('/')
    public GreetVisitor() {
        return 'great success!'
    }
}