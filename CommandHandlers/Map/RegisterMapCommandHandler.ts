import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { RegisterMapCommand } from '../../Commands/Map'
import { Repository } from '../Framework'
import { MapSearchReport } from '../../Reports/Entities/map'
import { Map } from '../../Domain/Map'

@CommandHandler(RegisterMapCommand)
export class RegisterMapCommandHandler implements ICommandHandler<RegisterMapCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: RegisterMapCommand) {
        const { Id, Name, TimeLimit } = command
        const props = await this.repository.Get<MapSearchReport, Map>(Id, MapSearchReport, Map)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.registerMap(Name, TimeLimit);
        await domain.commit()
        return;
    }
}