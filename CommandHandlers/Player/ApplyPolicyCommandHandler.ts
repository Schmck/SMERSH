import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ApplyPolicyCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(ApplyPolicyCommand)
export class ApplyPolicyCommandHandler implements ICommandHandler<ApplyPolicyCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ApplyPolicyCommand) {
        const { Id, PlayerId, ChannelId, Action, Name, Reason, Executioner, BanDate, UnbanDate, PlainId  } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(PlayerId as any, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.applyPolicy(Id, ChannelId, Action, Name, Reason, Executioner, BanDate, UnbanDate, PlainId);
        await domain.commit()
        return;

    }
}
