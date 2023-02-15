import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StatusRoute } from '../../../Services/WebAdmin/Routes';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { Parsers } from "../../Utils/Parsers";
import { StatusQuery } from '../../../Services/WebAdmin/Queries'
import { ReceiveChatLinesCommand } from '../../../Commands/Round'
import { Guid } from "guid-typescript";
import { SmershController } from '../../Framework'



@Controller()
export class CurrentStatusController extends SmershController {
    public constructor(protected readonly commandBus: CommandBus) {
        super(commandBus)
    }

    @Get('/current/status')
    public async getCurrentStatus() {
        const result = await StatusQuery.Get();
        this.commandBus.execute(new ReceiveChatLinesCommand(Guid.createEmpty(), Guid.createEmpty(), new Date(), ['']))
        return result ?? 'bad luck'
    }
}