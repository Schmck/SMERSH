import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common'
import { ReceiveChatLinesCommand } from '../../Commands/Round'
import { Repository } from '../Framework'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { Round } from '../../Domain/Round'

@CommandHandler(ReceiveChatLinesCommand)
export class ReceiveChatLinesCommandHandler implements ICommandHandler<ReceiveChatLinesCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command : ReceiveChatLinesCommand) {
        const { Id, Lines, Date } = command
        const props = await this.repository.Get<RoundSearchReport, Round>(Id, RoundSearchReport, Round)
        const domain = this.publisher.mergeObjectContext(props)

        await domain.receiveChatLines(Lines, Date)
        await domain.commit()
        return;

    }
}