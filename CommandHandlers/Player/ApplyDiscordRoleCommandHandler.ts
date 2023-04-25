import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ApplyDiscordRoleCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(ApplyDiscordRoleCommand)
export class ApplyDiscordRoleCommandHandler implements ICommandHandler<ApplyDiscordRoleCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ApplyDiscordRoleCommand) {
        const { Id, Role } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(Id, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.applyDiscordRole(Role);
        await domain.commit()
        return;

    }
}
