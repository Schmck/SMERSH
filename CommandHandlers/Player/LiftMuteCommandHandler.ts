import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { LiftMuteCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { Policy } from '../../Domain/Policy'

@CommandHandler(LiftMuteCommand)
export class LiftMuteCommandHandler implements ICommandHandler<LiftMuteCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: LiftMuteCommand) {
        const { Id } = command
        const props = await this.repository.Get<PolicySearchReport, Policy>(Id, PolicySearchReport, Policy)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.liftMute();
        await domain.commit();
        return;

    }
}
