import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction, GuildMember } from "discord.js";
import { Client } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { Api } from '../../Web/Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { PlayersRoute, PolicyRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery, PolicyQuery } from '../../Services/WebAdmin/Queries';
import { ApplyPolicyCommand } from '../../Commands/Player'
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { Utils } from '../Framework'
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Guid } from "guid-typescript";
import { stringify } from 'querystring'
import qs from 'qs'


export const MuteCommand: Command = {
    name: "mute",
    description: "prevent a player from using VOIP on the server",
    permissions: [DiscordRole.SmershAgent, DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'duration',
            description: 'duration of the ban',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'explain yourself',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        const players = await PlayerQuery.Get();
        if (players) {
            const choices = players.filter(player => !player.Bot && player.Id).map(player => { return { name: player.Playername, value: player.Id } })
            const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
            if (filtered.length) {
                interaction.respond(filtered.slice(0, 24));
            } else {
                const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                    query: {
                        regexp: {
                            "Name": {
                                "value": `.*${focusedValue.value}.*`,
                                "flags": "ALL",
                                "case_insensitive": true
                            }
                        }
                    },
                    size: 24,
                })
                if (players) {
                    const choices = players.map(player => { return { name: player.Name, value: player.Id } })
                    const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                    interaction.respond(filtered.slice(0, 24));
                }
            }
        } else {
            const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                query: {
                    regexp: {
                        "Name": {
                            "value": `.*${focusedValue.value}.*`,
                            "flags": "ALL",
                            "case_insensitive": true
                        }
                    }
                },
                size: 24,
            })
            if (players) {
                const choices = players.map(player => { return { name: player.Name, value: player.Id } })
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                interaction.respond(filtered.slice(0, 24));
            }
        }
    },
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        const duration = interaction.options.get('duration')
        const reason = interaction.options.get('reason')
        let unbanDate: Date;
        let match;
        let regexp;

        if (input && typeof (input.value) === 'string') {
            if (input.value.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                match = {
                    "Id": input.value
                }
            } else if (input.value.match(/[A-Z0-9]{9,10}/)) {
                match = {
                    "Id": `0x0110000${input.value}`
                }
            } else {
                regexp = {
                    "Name": {
                        "value": `.*${input.value}.*`,
                        "flags": "ALL",
                        "case_insensitive": true
                    }
                }
            }
        }

        if (duration && duration.value && typeof (duration.value) === 'string') {
            let [until, format] = duration.value.split(/([0-9]+)/).slice(1)
            let untilInt = parseInt(until, 10)
            let untilString = until
            unbanDate = new Date();

            switch (format) {
                case 'h':
                    unbanDate = addHours(unbanDate, untilInt);
                    untilString += ` ${untilInt === 1 ? 'Hour' : 'Hours'}`
                    break;
                case 'd':
                    unbanDate = addDays(unbanDate, untilInt);
                    untilString += ` ${untilInt === 1 ? 'Day' : 'Days'}`
                    break;
                case 'w':
                    unbanDate = addDays(unbanDate, untilInt * 7);
                    untilString += ` ${untilInt === 1 ? 'Week' : 'Weeks'}`
                    break;
                case 'm':
                    unbanDate = addMonths(unbanDate, untilInt);
                    untilString += ` ${untilInt === 1 ? 'Month' : 'Months'}`
                    break;
            }


            const player = (await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                "query": {
                    match,
                    regexp,
                }
            })).shift()

            if (player) {
                await client.commandBus.execute(new ApplyPolicyCommand(Guid.create(), player.Id, interaction.channelId, Action.Mute, player.Name, reason.value.toString(), (interaction.member as GuildMember).displayName, new Date(), unbanDate))

                await interaction.followUp({
                    ephemeral: true,
                    content: `${player.Name} was muted for ${untilString} for ${reason.value} until ${unbanDate.toString().split(' GMT')[0]}`
                });
            }
        }
    }
}

const addMonths = (date, months) => {
    date.setMonth(date.getMonth() + months);
    return date;
}

const addDays = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
}

const addHours = (date, hours) => {
    date.setHours(date.getHours() + hours);
    return date;
}