import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { ReceiveChatLineCommand } from '../../Commands/Round'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'
import { ChatQuery, StatusQuery } from '../../Services/WebAdmin/Queries'
import { Status } from 'discord.js';
import { Controller } from '@nestjs/common';


@Controller('chat')
export class ChatWatcher extends Watcher {

    public override async Watch(timeout: number = 1000, ...args: any[]) {
        const session = WebAdminSession.get();

        const messages = await ChatQuery.Get();
        const status = await StatusQuery.Get(); 
        const result = session.navigate(ChatRoute.GetChat.Action)

        messages.forEach(msg => {
            const date = new Date(new Date(msg.timestamp).setHours(new Date(msg.timestamp).getHours() + 1))
            const timestamp = msg.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}?` : ''
            const teamMessage = msg.team_message ? '(Team)' : ''
            const team = msg.team ? '-' : '+'

            const newmsg = `${team} ${timestamp} ${teamMessage} ${msg.name}: ${msg.message}`
            this.commandBus.execute(new ReceiveChatLineCommand(Guid.create(), Guid.create(), msg.timeStamp, newmsg));
        })

        setTimeout(() => {
            this.Watch(timeout, [...args, messages])
        }, timeout)

        return;
    }

}