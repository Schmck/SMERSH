import { CommandBus } from '@nestjs/cqrs'
import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../SMERSH/Utilities/FileLogger";
import { Client } from '../Discord/Framework'

export abstract class Watcher {

    public constructor(commandBus?: CommandBus, client?: Client) {
        this.commandBus = commandBus
        this.client = client;
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
    }

    public log: FileLogger;

    public client?: Client;

    protected commandBus?: CommandBus;
   

    public abstract Watch(timeout : number, ...args : any[]) : void
}