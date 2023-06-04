import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ApplyRoleBanCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PolicySearchReport } from '../../Reports/Entities/policy'
import { Player } from '../../Domain/Player'
import { Policy } from '../../Domain/Policy';

@CommandHandler(ApplyRoleBanCommand)
export class ApplyRoleBanCommandHandler implements ICommandHandler<ApplyRoleBanCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ApplyRoleBanCommand) {
        const { Id, PlayerId, ChannelId, Name, Reason, Role, Team, Side, Executioner, BanDate, UnbanDate } = command
        const props = await this.repository.Get<PolicySearchReport, Policy>(Id, PolicySearchReport, Policy)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.applyRoleBan(PlayerId, ChannelId, Name, Reason, Role, Team, Side, Executioner, BanDate, UnbanDate);
        await domain.commit()
        return;

    }
}
