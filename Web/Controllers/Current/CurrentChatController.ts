import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Logger, dummyLogger, Logger as ILogger } from "ts-log";
import { SmershController } from '../../Framework'
import { ChatQuery } from '../../../Services/WebAdmin/Queries'
import { ReceiveChatLineCommand } from '../../../Commands/Round'
import { Guid } from "guid-typescript";


@Controller()
export class CurrentChatController extends SmershController {
   
    @Get('/current/chat')
    public async getCurrentChat() {
        const messages = await ChatQuery.Get();
        messages.forEach(msg => {
            const date = new Date(new Date(msg.timestamp).setHours(new Date(msg.timestamp).getHours() + 1))
            const timestamp = msg.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}?` : ''
            const teamMessage = msg.team_message ? '(Team)' : ''
            const team = msg.team ? '-' : '+'

            const newmsg = `${team} ${timestamp} ${teamMessage} ${msg.name}: ${msg.message}`
            this.commandBus.execute(new ReceiveChatLineCommand(Guid.create(), Guid.create(), msg.timeStamp, newmsg));
        })
        return messages;
    }
}