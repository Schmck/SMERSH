import { Controller, Param, Body, Get, Post, Put, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { WebAdminSession } from '../../../Services/WebAdmin';
import { ChatRoute } from '../../../Services/WebAdmin/Routes';
import { Logger, dummyLogger, Logger as ILogger } from "ts-log";
import { SmershController } from '../../Framework'
import { ChatQuery } from '../../../Services/WebAdmin/Queries'
import { ReceiveChatLinesCommand } from '../../../Commands/Round'
import { Guid } from "guid-typescript";
import { SearchClient } from '../../../Elastic'
import { RoundSearchReport } from '../../../Reports/Entities/round'

@Controller()
export class CurrentChatController extends SmershController {
    public constructor(protected readonly commandBus: CommandBus) {
        super(commandBus)
    }

   
    @Get('/current/chat')
    public async getCurrentChat() {
        const messages = await ChatQuery.Get();
        const lastMessage = messages[messages.length - 1];
        const lastMessageDate = new Date(lastMessage.timestamp);
        const round = await (await SearchClient.Search(RoundSearchReport, {
            "query": {
                "match_all": {}
            },
            "size": 1,
            "sort": [
                {
                    "Date": {
                        "order": "desc"
                    }
                }
            ]
        })).shift();

        let msgs = messages.map(msg => {
            const date = new Date(new Date(msg.timestamp).setHours(new Date(msg.timestamp).getHours() + 1))
            const timestamp = msg.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}│` : ''
            const teamMessage = msg.team_message ? '(Team)' : ''
            let team = msg.team === 'Axis' ? '+' : '-'

            const newmsg = `${team} ${timestamp} ${teamMessage} ${msg.username}: ${msg.message}`
            return newmsg
        })
        if (msgs.length && round && (round.Date.getDate() === lastMessageDate.getDate() && round.Date.getHours() === lastMessageDate.getHours())) {
            this.commandBus.execute(new ReceiveChatLinesCommand(Guid.createEmpty(), new Date(), msgs));
        }

        return messages;
    }
}