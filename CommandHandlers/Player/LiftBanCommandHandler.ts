import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { LiftBanCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'
import { PolicySearchReport } from '../../Reports/Entities/policy';
import { Policy } from '../../Domain/Policy';

@CommandHandler(LiftBanCommand)
export class LiftBanCommandHandler implements ICommandHandler<LiftBanCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: LiftBanCommand) {
        const { Id, PlayerId} = command
        const props = await this.repository.Get<PolicySearchReport, Policy>(Id, PolicySearchReport, Policy)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.liftBan(PlayerId);
        await domain.commit();
        return;

    }
}
