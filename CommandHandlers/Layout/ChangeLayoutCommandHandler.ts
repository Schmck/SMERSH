import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { ChangeLayoutCommand } from '../../Commands/Layout'
import { Repository } from '../Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Layout as LayoutDomain } from '../../Domain/Layout'
import { LayoutSearchReport } from '../../Reports/Entities/layout';


@CommandHandler(ChangeLayoutCommand)
export class ChangeLayoutCommandHandler implements ICommandHandler<ChangeLayoutCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command: ChangeLayoutCommand) {
        const { Id, Name, Layout } = command
        const props = await this.repository.Get<LayoutSearchReport, LayoutDomain>(Id, LayoutSearchReport, LayoutDomain)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.changeLayout(Name, Layout);
        await domain.commit()
        return;

    }
}
