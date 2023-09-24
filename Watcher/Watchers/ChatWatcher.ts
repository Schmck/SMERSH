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
import { Message } from '../../SMERSH/ValueObjects/round';
import { PlayerInfo } from '../../Services/WebAdmin/Models';

export class ChatWatcher extends Watcher {

    public override async Watch(timeout: number = 50, ...args: Array<{ messages: Array<Message>, players: Record<string, PlayerSearchReport>}>) {
        const commandNames = Commands.map(command => [command.name, ...command.aliases]).flat()
        const commands = Commands.map(command => command.name).flat()
        const messages = await ChatQuery.Get();
        const lastMessage = messages[messages.length - 1];
        const roundInfo = global && global.roundInfo;
        const round = !roundInfo && await (await SearchClient.Search(RoundSearchReport, {
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
        const roundId = round ? round.Id : roundInfo && roundInfo.roundId;
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            },
        }
        let players = (args[0] && args[0].players) || {}

        if (!Object.values(players).length) {
            players = (await SearchClient.Search(PlayerSearchReport, {
                "query": {
                    "exists": {
                        "field": "Role"
                    }
                }
            })).reduce((list, player) => { return { ...list, [player.Id]: player } }, {})

        }


        if (messages.length) {
            messages.forEach(async msg => {
                if (msg.message.startsWith('/') || msg.message.startsWith('!') || msg.message.startsWith('\\') || msg.message.startsWith('>') || (msg.message.startsWith(':') && !msg.message.includes(':/'))) {
                    const commandName = msg.message.split(' ')[0].slice(1)
                    if (commandNames.includes(commandName)) {
                        let player = players[msg.id]
                        if (!player) {
                            player = await SearchClient.Get(msg.id as any, PlayerSearchReport)
                        }
                        const command = Commands.find(comm => comm.name === commandName || comm.aliases.includes(commandName))
                        if (typeof (player.Role) === 'number' && command.permissions.find(perm => perm.Value === player.Role)) {
                            const input = msg.message.match(/\#[A-Z0-9]{0,4}\:/) ? msg.message.slice(0, msg.message.match(/\#[A-Z0-9]{0,4}\:/).index) : msg.message
                            const caller = players[msg.id]
                            const { player, name, id, reason, duration } = this.parseCommand(input.split(' ').slice(1))

                            //(commandBus: CommandBus, caller: PlayerSearchReport, player: PlayerInfo, name: string, reason: string, duration: string)
                            command.run(this.commandBus, caller, player, name, id, reason, duration)
                        } else if (typeof (player.Role) === 'number') {
                            const frown = Math.floor(Math.random() * 32) > 28 ? '. :/ ' : ''

                            const message = `you do not have the required permissions to use this command ${msg.username}[${msg.id.slice(9)}]${frown}`
                            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                            await axios.post(chatUrl, chatUrlencoded, config)
                        }

                    } else {
                        const commandName = msg.message.split(' ')[0].slice(1)
                        const chars = commandName.split('').filter((char, i, self) => (self.indexOf(char) === i) || Math.abs(self.indexOf(char) - i) === 1);
                        const options = commands.reduce((opts, opt) => {
                            return { ...opts, [opt]: 0 }
                        }, {})


                        for (let i = 0; i < chars.length; i++) {
                            let char = chars[i]
                            commands.forEach(cmd => {
                                if (cmd.includes(char)) {
                                    options[cmd] = options[cmd] + 1
                                }
                            })
                        }

                        const sorted = Object.entries(options).sort((optA, optB) => (optB[1] as number) - (optA[1] as number)).map(opt => opt[0])
                        sorted.some(async opt => {
                            const val = options[opt]
                            const perc = (100 / opt.length) * val

                            if (perc > 30 && perc < 60) {
                                const message = `did you mean !${opt}`
                                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                                await axios.post(chatUrl, chatUrlencoded, config)
                                return true;
                            }

                            if (perc >= 60) {
                                const player = await SearchClient.Get(msg.id as any, PlayerSearchReport)
                                const command = Commands.find(comm => comm.name === opt || comm.aliases.includes(opt))

                                if (typeof (player.Role) === 'number' && command.permissions.find(perm => perm.Value === player.Role)) {
                                    const input = msg.message.match(/\#[A-Z0-9]{0,4}\:/) ? msg.message.slice(0, msg.message.match(/\#[A-Z0-9]{0,4}\:/).index) : msg.message
                                    const { name, id, reason, duration } = this.parseCommand(input.split(' ').slice(1))
                                    command.run(this.commandBus, msg.username, name, id, reason, duration)
                                } else if (typeof (player.Role) === 'number') {
                                    const frown = Math.floor(Math.random() * 32) >= 16 ? '. :/ ' : ''

                                    const message = `you do not have permission to use this command ${msg.username}[${msg.id.slice(9)}]${frown}`
                                    const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                                    await axios.post(chatUrl, chatUrlencoded, config)
                                }
                                return true;
                            }

                            return false;
                        })
                    }
                } else if (msg.message.includes(':/') && msg.username !== 'admin' && Math.floor(Math.random() * 32) >= 28) {
                    const message = `:/`
                    const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                    await axios.post(chatUrl, chatUrlencoded, config)
                }

            })

            await this.commandBus.execute(new ReceiveChatLinesCommand(Guid.parse(roundId), new Date(), messages));
        }

        setTimeout(async () => {
            await this.Watch(timeout, {...args[0], messages, players })
            return;
        }, timeout)

        return;
    }

    public parseCommand(command: Array<string>) {
        let formats = ['h', 'd', 'w', 'm']
        let duration
        let reason
        let player;
        let name
        let id

        command.forEach((comm, i) => {
            if (!player && global.currentPlayers && Object.values(global.currentPlayers).length) {
                player = this.match(comm, global.currentPlayers);
            }


            if (player) {
                name = player.Playername;
                id = player.Id;
            } else if (comm && comm.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                id = comm
            } else if (comm && comm.match(/[A-Z0-9]{9,10}/)) {
                id = `0x0110000${comm}`
            } else if (!name) {
                name = comm

            }

            if (comm.match(/^\d+[A-Za-z]$/) && formats.some(f => comm.endsWith(f))) {
                duration = comm
                if (!reason && (name || id)) {
                    reason = command.slice(i + 1).join(' ')
                }
            } else if (!command.find(cm => cm.match(/^\d+[A-Za-z]$/)) && !duration && !reason && (name || id)) {
                reason = command.slice(i + 1).join(' ')
            }

        })

        return {
            player,
            name,
            id,
            duration,
            reason,

        }

    }

    public match(input: string, comparison: Record<string, PlayerInfo>) : PlayerInfo {
        const comparisons = Object.values(comparison)
        const chars = input.toLowerCase().split('')
        const tracking = comparisons.reduce((opts, opt) => {
            return { ...opts, [opt.Playername]: [opt.Id, opt.Playername.split('').map(char => true)] }
        }, {})

        comparisons.map(opt => opt.Playername).forEach(opt => {
            for (let i = 0; i < chars.length; i++) {
                let char = chars[i]
                const last = (tracking[opt][1].includes(false) && tracking[opt][1].indexOf(false)) || 0
                const start = (tracking[opt][1].indexOf(true) && tracking[opt][1].indexOf(true, last)) || 0
                const index = opt.toLowerCase().indexOf(char, start)

                if (index >= 0 && tracking[opt][1][index] && ((!last && !index) || (last === index - 1 && !tracking[opt][1][last]))) {
                    tracking[opt][1][index] = false
                }
            }

        })

        let best
        const sorted = Object.entries(tracking)
            .filter((opt) => opt[1][1].includes(false))
            .map(opt => [opt[0], (opt[1][1]).filter(o => !o).length])
            .sort((optA, optB) => (optB[1]) - (optA[1])).map(opt => opt[0])

        sorted.some((opt) => {
            const parts = this.splitName(opt)
            const val = tracking[opt][1].filter(o => !o).length
            let perc = (100 / opt.length) * val
            parts.forEach(part => {
                if (part.toLowerCase().startsWith(input)) {
                    perc = perc * part.length
                }
            })
            if (perc >= 50) {
                best = opt
                return true
            }
            return false
        })
        if (best) {
            return comparison[tracking[best][0]]

        }
        return null;
}

    public splitName(input: string) {
        const capitals = input.match(/[A-Z](?![A-Z])/g)
        const parts = []

        console.log(input)
        if (capitals && capitals.length) {
            if (capitals.length === 1 && input.indexOf(capitals[0]) === 0) {
                parts.push(input)
                return parts
            }
            console.log(capitals)
            for (let i = 0; i < capitals.length; i++) {
                const capital = capitals[i]
                const next = i < capitals.length && capitals[i + 1]
                const index = input.indexOf(capital)
                const end = next ? input.indexOf(next) : input.length
                console.log(input, capital, index, end)
                parts.push(input.slice(index, end))

            }
        } else {
            parts.push(input)
        }
        return parts
    }
}