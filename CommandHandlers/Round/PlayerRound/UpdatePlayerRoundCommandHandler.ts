import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { UpdatePlayerRoundCommand } from '../../../Commands/Round/PlayerRound'
import { Repository } from '../../Framework'
import { PlayerRoundSearchReport } from '../../../Reports/Entities/round/playerRound'
import { PlayerRound } from '../../../Domain/PlayerRound'

@CommandHandler(UpdatePlayerRoundCommand)
export class UpdatePlayerRoundCommandHandler implements ICommandHandler<UpdatePlayerRoundCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: UpdatePlayerRoundCommand) {
        const { Id, PlayerId, RoundId, Role, Team, Attacking, Score, Kills, Deaths } = command
        const props = await this.repository.Get<PlayerRoundSearchReport, PlayerRound>(Id, PlayerRoundSearchReport, PlayerRound)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.update(PlayerId, RoundId, Team, Role, Attacking, Score, Kills, Deaths);
        await domain.commit()
        return;
    }
}