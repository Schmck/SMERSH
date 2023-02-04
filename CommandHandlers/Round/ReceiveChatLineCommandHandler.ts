import { ICommandHandler, EventPublisher, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common'
import { ReceiveChatLineCommand } from '../../Commands/Round'
import { Repository } from '../Framework'
import { RoundSearchReport } from '../../Reports/Entities/round'
import { Round } from '../../Domain/Round'

@CommandHandler(ReceiveChatLineCommand)
export class ReceiveChatLineCommandHandler implements ICommandHandler<ReceiveChatLineCommand> {
    constructor(
        protected readonly publisher: EventPublisher,
        protected readonly repository: Repository
    ) {
    }

    async execute(command : ReceiveChatLineCommand) {
        const { Id, Line, Date } = command
        const domain = this.publisher.mergeObjectContext(await this.repository.Get<RoundSearchReport, Round>(Id, new RoundSearchReport()))
        domain.receiveChatLine(Line, Date)
        domain.commit();

    }
}