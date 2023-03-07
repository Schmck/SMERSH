import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangeMapCommand } from '../../Commands/Round'
import { Repository } from '../Framework'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { Round } from '../../Domain/Round'

@CommandHandler(ChangeMapCommand)
export class ChangeMapCommandHandler implements ICommandHandler<ChangeMapCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangeMapCommand) {
        const { Id, MapId, MapName } = command
        const props = await this.repository.Get<RoundSearchReport, Round>(Id, RoundSearchReport, Round)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeMap(MapId, MapName);
        await domain.commit()
        return;
    }
}