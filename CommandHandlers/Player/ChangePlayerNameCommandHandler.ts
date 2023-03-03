import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangePlayerNameCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(ChangePlayerNameCommand)
export class ChangePlayerNameCommandHandler implements ICommandHandler<ChangePlayerNameCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangePlayerNameCommand) {
        const { Id, Name } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(Id, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeName(Name);
        await domain.commit()
        return;

    }
}
