import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { EndRoundCommand } from '../../Commands/Round'
import { Repository } from '../Framework'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { Round } from '../../Domain/Round'

@CommandHandler(EndRoundCommand)
export class EndRoundCommandHandler implements ICommandHandler<EndRoundCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: EndRoundCommand) {
        const { Id, Date, Players } = command
        const props = await this.repository.Get<RoundSearchReport, Round>(Id, RoundSearchReport, Round)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.endRound(Date, Players)
        await domain.commit();
        return;

    }
}