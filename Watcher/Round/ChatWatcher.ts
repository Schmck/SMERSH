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
import { Client } from '../../Discord/Framework';
import { Commands } from '../Commands'
import { PlayerSearchReport } from '../../Reports/Entities/player';
import { AxiosRequestConfig } from 'axios';
import { Api } from '../../Web/Framework';


export class ChatWatcher extends Watcher {

    public override async Watch(timeout: number = 100, ...args: any[]) {
        const commandNames = Commands.map(command => [command.name, ...command.aliases]).flat()
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
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }


        if (roundDate && lastMessageDate && (roundDate.getDate() === lastMessageDate.getDate())) {
            if (messages.length) {
                messages.forEach(async msg => {
                    if (msg.message.startsWith('/') || msg.message.startsWith('!') || msg.message.startsWith('\\') || msg.message.startsWith('>') || (msg.message.startsWith(':') && !msg.message.includes(':/'))){
                        const commandName = msg.message.split(' ')[0].slice(1)
                        if (commandNames.includes(commandName)) {
                            const player = await SearchClient.Get(msg.id as any, PlayerSearchReport)
                            const command = Commands.find(comm => comm.name === commandName || comm.aliases.includes(commandName))
                            if (typeof (player.Role) === 'number' && command.permissions.find(perm => perm.Value === player.Role)) {
                                const input = msg.message.slice(0, msg.message.match(/\#[A-Z0-9]{0,4}\:/).index)
                                const { name, id, reason, duration } = this.parseCommand(input.split(' ').slice(1))
                                command.run(this.commandBus, msg.username, name, id, reason, duration)
                            } else if (typeof (player.Role) === 'number') {
                                const frown = (Math.floor(Math.random() * (32 - 1 + 1) + 1)) === 32 ? '. :/ ' : ''
                              
                                const message = `you do not have the required permissions to use this command ${msg.username}[${msg.id.slice(9)}]${frown}`
                                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                                await axios.post(chatUrl, chatUrlencoded, config)
                            } else if ((Math.floor(Math.random() * (32 - 1 + 1) + 1)) === 32) {
                                const message = `:/`
                                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                                await axios.post(chatUrl, chatUrlencoded, config)
                            }

                        }
                    } else if (msg.message.includes(':/') && msg.username !== 'admin' && (Math.random() * (32 - 1 + 1) + 1) === 32) {
                        const message = `:/`
                        const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                        const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                        await axios.post(chatUrl, chatUrlencoded, config)
                    }
                    
                })

                await this.commandBus.execute(new ReceiveChatLinesCommand(Guid.parse(round.Id), new Date(), messages));
            }
        }
        setTimeout(async () => {
            await this.Watch(timeout, [...args, messages])
            return;
        }, timeout)

        return;
    }

    public parseCommand(command: Array<string>) {
        let formats = ['h', 'd', 'w', 'm']
        let duration
        let reason
        let name
        let id

        command.forEach((comm, i) => {
            if (comm.match(/^\d+[A-Za-z]$/) && formats.some(f => comm.endsWith(f))) {
                duration = comm
                if (!reason && (name || id)) {
                    reason = command.slice(i + 1).join(' ')
                }
            } else if (!reason && (name || id)) {
                reason = command.slice(i).join(' ')
            }

            if (comm && comm.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                id = comm
            } else if (comm && comm.match(/[A-Z0-9]{9,10}/)) {
                id = `0x0110000${comm}`
            } else if (!name && !id) {
                name = comm
            }



        })

        return {
            name,
            id,
            duration,
            reason,

        }

    }

}