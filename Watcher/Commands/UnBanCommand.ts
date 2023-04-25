import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Command } from "./Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand, LiftBanCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../../Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { ChatRoute, PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery } from '../../Services/WebAdmin/Queries'
import { CommandBus } from "@nestjs/cqrs";
import { PolicySearchReport } from "../../Reports/Entities/policy";

export const UnBanCommand: Command = {
    name: "unban",
    aliases: ["ub"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent],
    run: async (commandBus: CommandBus, name: string, id: string) => {
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
                    "PlayerId": id
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

        if (regexp) {
            const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                "query": {
                    regexp
                }
            })

            if (players.length > 1) {
                const message = `Multiple players found matching ${name}: [${players.map(player => `${player.Name}[${player.Id.slice(9)}]`).join('\, ')}]`
                const url = env["BASE_URL"] + ChatRoute.PostChat.Action
                const urlencoded = `ajax=1&message=${message}&teamsay=-1`
                await axios.post(url, urlencoded, config)
                return;
            }

            const player = players.shift();
            if (player) {
                match = {
                    "PlayerId": player.Id,
                }
            }
        }

        const policy = (await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "IsActive": true
                            }
                        },
                        {
                            "match": {
                                "Action": Action.Ban.DisplayName
                            }
                        },
                        {
                            match
                        }
                    ]

                }
            },
        })).shift()

        if (policy) {
            await commandBus.execute(new LiftBanCommand(Guid.parse(policy.Id), Guid.parse(policy.PlayerId)))

            const message = `${policy.Name} was unbanned`
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