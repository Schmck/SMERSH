import { CommandBus } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'

export abstract class Watcher {

    @Inject(CommandBus)
    protected readonly commandBus: CommandBus

    public constructor(commandBus) {
        this.commandBus = commandBus
    }
   

    public abstract Watch(timeout : number, ...args : any[]) : void
}