import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Command } from "./Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../../Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { ChatRoute, PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery } from '../../Services/WebAdmin/Queries'
import { CommandBus } from "@nestjs/cqrs";

export const MuteCommand: Command = {
    name: "mute",
    aliases: ["m"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent],
    run: async (commandBus: CommandBus, caller: string, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }
        let unbanDate: Date;
        let match;
        let regexp;

        if (id && typeof (id) === 'string') {
            if (id.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                match = {
                    "Id": id
                }
            }
        } else {
            regexp = {
                "Name": {
                    "value": `.*${name}.*`,
                    "flags": "ALL",
                    "case_insensitive": true
                }
            }
        }



        const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
            "query": {
                match,
                regexp
            }
        })
        const player = players.shift();

        if (duration && duration && typeof (duration) === 'string') {
            let [until, format] = duration.split(/([0-9]+)/).slice(1)
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

            if (player) {
                await commandBus.execute(new ApplyPolicyCommand(Guid.create(), player.Id, env["COMMAND_CHANNEL_ID"], Action.Mute, player.Name, reason, new Date(), unbanDate))

                const message = `${player.Name} was muted for ${untilString} for ${reason} until ${unbanDate.toString().split(' GMT')[0]}`
                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                await axios.post(chatUrl, chatUrlencoded, config)
            } else {
                const message = `${name} could not be found in the database`
                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                await axios.post(chatUrl, chatUrlencoded, config)
            }
        }

        if (players.length > 1) {
            const message = `Multiple players found matching ${name}: [${players.map(player => `${player.Name}[${player.Id.slice(9)}]`).join('\, ')}]`
            const url = env["BASE_URL"] + ChatRoute.PostChat.Action
            const urlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(url, urlencoded, config)
            return;
        }
    }
};

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