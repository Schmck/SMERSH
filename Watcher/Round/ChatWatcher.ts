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
import { SearchClient } from '../../Elastic'
import { RoundSearchReport } from '../../Reports/Entities/round'


export class ChatWatcher extends Watcher {

    public constructor(commandBus: CommandBus) {
        super(commandBus)
    }

    public override async Watch(timeout: number = 1000, ...args: any[]) {
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
        })).shift()
        if (round && (round.Date.getDate() === lastMessageDate.getDate() && round.Date.getHours() === lastMessageDate.getHours() )) {
            let msgs = messages.map(msg => {
                const date = new Date(new Date(msg.timestamp).setHours(new Date(msg.timestamp).getHours()))
                const timestamp = msg.timestamp ? `${date.toLocaleString().slice(0, date.toLocaleString().indexOf(','))} ${date.toTimeString().slice(0, 8)}|` : ''
                const teamMessage = msg.team_message ? '(Team)' : ''
                let team = msg.team === 'Axis' ? '+' : '-'

                const newmsg = `${team} ${timestamp} ${teamMessage} ${msg.username}: ${msg.message}`
                return newmsg
            })
            if (msgs.length) {
                await this.commandBus.execute(new ReceiveChatLinesCommand(Guid.parse(round.Id), new Date(), msgs));
            }
        }
        setTimeout(async () => {
            await this.Watch(timeout, [...args, messages])
            return;
        }, timeout)

        return;
    }

}