import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangeVisibilityCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(ChangeVisibilityCommand)
export class ChangeVisibilityCommandHandler implements ICommandHandler<ChangeVisibilityCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangeVisibilityCommand) {
        const { Id, Invisible } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(Id, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeVisibility(Invisible);
        await domain.commit();
        return;

    }
}