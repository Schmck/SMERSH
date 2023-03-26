import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { RegisterPlayerCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(RegisterPlayerCommand)
export class RegisterPlayerCommandHandler implements ICommandHandler<RegisterPlayerCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: RegisterPlayerCommand) {
        const { Id, Name } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(Id, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.register(Name);
        await domain.commit();

        return;
    }
}
