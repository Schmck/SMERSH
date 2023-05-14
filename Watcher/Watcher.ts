import { CommandBus } from '@nestjs/cqrs'
import { FileLogger } from "../SMERSH/Utilities/FileLogger";
import { Client, Logger } from '../Discord/Framework'
import SteamApi from 'steamapi'

export abstract class Watcher {

    public constructor(commandBus?: CommandBus, client?: Client, steamToken?: string) {
        this.commandBus = commandBus
        this.client = client;
        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        this.steam = new SteamApi(steamToken ?? process.env["STEAM_TOKEN"])
    }

    public log: FileLogger;

    public client?: Client;

    protected commandBus?: CommandBus;

    public steam: SteamApi;

    public abstract Watch(timeout : number, ...args : any[]) : void
}