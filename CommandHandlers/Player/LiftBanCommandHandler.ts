import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { LiftBanCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(LiftBanCommand)
export class LiftBanCommandHandler implements ICommandHandler<LiftBanCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: LiftBanCommand) {
        const { Id, PlayerId} = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(PlayerId, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.liftBan(Id);
        await domain.commit();
        return;

    }
}
