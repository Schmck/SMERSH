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
        const domain = this.publisher.mergeObjectContext(await this.repository.Get<RoundSearchReport, Round>(Id, RoundSearchReport, Round))

        await domain.receiveChatLines(Lines, Date)
        await domain.commit()
        return;
        //for (let line of Lines) {
         //   this.call(() => {
         //       domain.receiveChatLine(line, Date)
        //        domain.commit();
        //    })
       // }

    }

    async call(func: (...args: any[]) => void, ...args: any[]) {
    setTimeout(() => {
        func(...args)
    }, 1000)
    }
}