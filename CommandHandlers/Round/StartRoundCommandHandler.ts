import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { StartRoundCommand } from '../../Commands/Round'
import { Repository } from '../Framework'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { Round } from '../../Domain/Round'

@CommandHandler(StartRoundCommand)
export class StartRoundCommandHandler implements ICommandHandler<StartRoundCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: StartRoundCommand) {
        const { Id, MapId, Date, Players } = command
        const props = await this.repository.Get<RoundSearchReport, Round>(Id, RoundSearchReport, Round)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.startRound(MapId, Date, Players)
        await domain.commit()
        return;

    }

    async call(func: (...args: any[]) => void, ...args: any[]) {
        setTimeout(() => {
            func(...args)
        }, 1000)
    }
}