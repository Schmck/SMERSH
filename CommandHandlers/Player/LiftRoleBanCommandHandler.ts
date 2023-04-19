import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { LiftRoleBanCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { Policy } from '../../Domain/Policy'

@CommandHandler(LiftRoleBanCommand)
export class LiftRoleBanCommandHandler implements ICommandHandler<LiftRoleBanCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: LiftRoleBanCommand) {
        const { Id, Role } = command
        const props = await this.repository.Get<PolicySearchReport, Policy>(Id, PolicySearchReport, Policy)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.liftRoleBan(Role);
        await domain.commit();
        return;

    }
}
