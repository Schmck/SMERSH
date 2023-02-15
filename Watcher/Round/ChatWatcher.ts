import { Watcher } from '../Watcher'
import { WebAdminSession } from '../../Services/WebAdmin';
import { ChatRoute } from '../../Services/WebAdmin/Routes';
import { ReceiveChatLinesCommand } from '../../Commands/Round'
import { Guid } from 'guid-typescript'
import { Team } from '../../SMERSH/ValueObjects'
import { ChatQuery, StatusQuery } from '../../Services/WebAdmin/Queries'
import { Status } from 'discord.js';
import { Controller, Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs'


@Injectable()
export class ChatWatcher extends Watcher {

    public constructor(@Inject(CommandBus) protected readonly commandBus: CommandBus = {} as CommandBus) {
        super(commandBus)
    }

    public override async Watch(timeout: number = 1000, ...args: any[]) {
        const messages = await ChatQuery.Get();

        let msgs = messages.map(msg => {
            const date = new Date(new Date(msg.timestamp).setHours(new Date(msg.timestamp).getHours() + 1))
            const timestamp = msg.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}?` : ''
            const teamMessage = msg.team_message ? '(Team)' : ''
            let team = msg.team === 'Axis' ? '+' : '-'

            const newmsg = `${team} ${timestamp} ${teamMessage} ${msg.username}: ${msg.message}`
            return newmsg
        })
        if (msgs.length) {
            this.commandBus.execute(new ReceiveChatLinesCommand(Guid.createEmpty(), Guid.createEmpty(), new Date(), msgs));
        }
        setTimeout(() => {
            this.Watch(timeout, [...args, messages])
        }, timeout)

        return;
    }

}