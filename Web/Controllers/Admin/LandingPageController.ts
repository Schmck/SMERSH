import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../../SMERSH/Utilities'
import { Config, ClientBuilder } from '../../Framework';

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

    @Get('/elastic')
    public BuildIndices() {
        const config = process.env;
        console.log(config["ELASTIC_URL"])
        return ClientBuilder.Build(config["ELASTIC_URL"])
    }
}