import { CommandBus } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'

export abstract class Watcher {

    @Inject(CommandBus)
    protected readonly commandBus: CommandBus

    constructor() {}
   

    public abstract Watch(timeout : number, ...args)
}