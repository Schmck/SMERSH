import { CommandBus } from '../SMERSH/command-bus'

export abstract class Watcher {
    constructor(protected commandBus: CommandBus) {}
   

    public abstract Watch()
}