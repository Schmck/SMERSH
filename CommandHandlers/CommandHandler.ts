import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Repository } from './Framework'
export class CommandHandler<T> implements ICommandHandler<T> {
    constructor(
    private repository: Repository,
    private publisher: EventPublisher
    ) {}

    execute(command: T): Promise<any> {
         throw new Error("Not implemented");
    }
}