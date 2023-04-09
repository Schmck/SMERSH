import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Client } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { Api } from '../../Web/Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { PlayersRoute, PolicyRoute } from '../../Services/WebAdmin/Routes';
import { PolicyQuery } from '../../Services/WebAdmin/Queries';
import { ApplyPolicyCommand } from '../../Commands/Player'
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { Utils } from '../Framework'
import { Action } from "../../SMERSH/ValueObjects/player";
import { Guid } from "guid-typescript";
import { stringify } from 'querystring'
import qs from 'qs'


export const TempbanCommand: Command = {
    name: "tempban",
    description: "temporarily ban a player from the server",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'duration',
            description: 'duration of the ban',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'reason',
            description: 'explain yourself',
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        const duration = interaction.options.get('duration')
        const reason = interaction.options.get('reason')
        let unbanDate: Date;
        let match;
        let regexp

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


            const plainId = await PolicyQuery.GetNextPlainId();
            const player = (await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                "query": {
                    match,
                    regexp,
                }
            })).shift()

            if (player) {
                client.log.info('channelid', interaction.channelId as any as Guid);
                client.log.info('playerid', player.Id as any as Guid);
                const env = process.env;

                
                const axios = Api.axios();
                const url = env["BASE_URL"] + PolicyRoute.AddBan.Action
                const urlencoded = qs.stringify({
                    "uniqueid": player.Id,
                    "action": 'add'
                })

                const config: AxiosRequestConfig =
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        "Cookie": `authcred="${env["AUTHCRED"]}"`
                    },
                }
                

                await axios.post(url, urlencoded, config).then(result => {
                     client.log.info(JSON.stringify(result.data))
                });

                await client.commandBus.execute(new ApplyPolicyCommand(Guid.create(), player.Id, interaction.channelId, Action.Ban, player.Name, reason.value.toString(), new Date(), unbanDate, plainId))

                await interaction.followUp({
                    ephemeral: true,
                    content: `${player.Name} was banned for ${untilString} for ${reason.value} until ${unbanDate.toString().split(' GMT')[0]}`
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