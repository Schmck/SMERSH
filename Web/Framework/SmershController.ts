import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
const elastic = require('@elastic/elasticsearch')
const { Client } = elastic;
import { NodesClient } from '@elastic/elasticsearch/lib/api/types';
import { ConfigOptions } from 'elasticsearch';
import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller()
export class SmershController {
    public log: FileLogger;
    protected readonly commandBus;
    public constructor(log: Logger = dummyLogger, commandBus: CommandBus) {
        this.commandBus = commandBus
        this.log = new FileLogger(`./info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        this.client = new Client({
            node: process.env["ELASTIC_URL"],
        } as ConfigOptions)
    }

    public client : Awaited<typeof Client> 
}