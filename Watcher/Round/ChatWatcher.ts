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
        const lastMessageDate = messages.length ? new Date(lastMessage.timestamp) : false;
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

        const roundDate = round ? new Date(round.Date) : false

        if (roundDate && lastMessageDate && (roundDate.getDate() === lastMessageDate.getDate())) {
            if (messages.length) {
                await this.commandBus.execute(new ReceiveChatLinesCommand(Guid.parse(round.Id), new Date(), messages));
            }
        }
        setTimeout(async () => {
            await this.Watch(timeout, [...args, messages])
            return;
        }, timeout)

        return;
    }

}