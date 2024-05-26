import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
const elastic = require('@elastic/elasticsearch')
const { Client } = elastic;
import { NodesClient } from '@elastic/elasticsearch/lib/api/types';
import { ConfigOptions } from 'elasticsearch';
import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core/injector';


@Controller()
export class SmershController {
 
    public constructor(commandBus?: CommandBus) {
        this.commandBus = commandBus
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        const url = JSON.parse(process.env.NODE_ENV)["ELASTIC_URL"]
        this.client = new Client({
            node: url,
        } as ConfigOptions)
    }

    public log: FileLogger;

    protected commandBus : CommandBus;

    public client: Awaited<typeof Client> 

}