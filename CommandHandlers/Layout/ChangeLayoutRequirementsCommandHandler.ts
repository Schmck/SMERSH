import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangeLayoutRequirementsCommand } from '../../Commands/Layout'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Layout as LayoutDomain } from '../../Domain/Layout'
import { LayoutSearchReport } from '../../Reports/Entities/layout';


@CommandHandler(ChangeLayoutRequirementsCommand)
export class ChangeLayoutRequirementsCommandHandler implements ICommandHandler<ChangeLayoutRequirementsCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangeLayoutRequirementsCommand) {
        const { Id, MinimumPlayerCount, MaximumPlayerCount, StartTime, EndTime } = command
        const props = await this.repository.Get<LayoutSearchReport, LayoutDomain>(Id, LayoutSearchReport, LayoutDomain)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeLayoutRequirements(MinimumPlayerCount, MaximumPlayerCount, StartTime, EndTime);
        await domain.commit()
        return;

    }
}
