import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangePlayerIpAddressCommand } from '../../Commands/Player'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Player } from '../../Domain/Player'

@CommandHandler(ChangePlayerIpAddressCommand)
export class ChangePlayerIpAddressCommandHandler implements ICommandHandler<ChangePlayerIpAddressCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangePlayerIpAddressCommand) {
        const { Id, IpAddress } = command
        const props = await this.repository.Get<PlayerSearchReport, Player>(Id, PlayerSearchReport, Player)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeIpAddress(IpAddress);
        await domain.commit()
        return;

    }
}
