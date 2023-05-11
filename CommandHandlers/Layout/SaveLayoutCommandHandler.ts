import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { SaveLayoutCommand } from '../../Commands/Layout'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Layout as LayoutDomain } from '../../Domain/Layout'
import { LayoutSearchReport } from '../../Reports/Entities/layout';


@CommandHandler(SaveLayoutCommand)
export class SaveLayoutCommandHandler implements ICommandHandler<SaveLayoutCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: SaveLayoutCommand) {
        const { Id, Name, Layout } = command
        const props = await this.repository.Get<LayoutSearchReport, LayoutDomain>(Id, LayoutSearchReport, LayoutDomain)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.saveLayout(Name, Layout);
        await domain.commit()
        return;

    }
}
