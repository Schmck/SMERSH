import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Command } from "../Framework/Command"
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
import { Client, Utils } from "../Framework";

export const MeowCommand: Command = {
    name: "meow",
    description: "hahaha Meow!",
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const axios = Api.axios();
        const env = JSON.parse(process.env);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
            },
        }
        const input = interaction.options.get('input')
        let match
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



        const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
            "query": {
                match,
                regexp
            }
        })
        const player = players.shift();

        if (players.length > 1) {
            let playerTable: string = await Utils.generatePlayerTable(players, false)
            await interaction.followUp({
                ephemeral: true,
                content: `\`\`\`prolog
                ${playerTable}
                \`\`\``,
            });
            return;
        }

        if (player) {
            const messages = [`${player.Name} ha ha ha ha Meow!`, `Meow ha ha... ${player.Name} Meow!`, `${player.Name} Meow!`]
            const message = messages[Math.floor(Math.random() * (2 - 0 + 1) + 0)]
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
            await interaction.followUp({
                content: message
            });
        } else {
            const playa = await PlayerQuery.GetByName(input.value.toString())
            if (playa) {
                const messages = [`${playa.Playername} ha ha ha ha Meow!`, `Meow ha ha... ${playa.Playername} Meow!`, `${playa.Playername} Meow!`]
                const message = messages[Math.floor(Math.random() * (2 - 0 + 1) + 0)]
                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                const chatUrlencoded = `ajax=1&message=${messages[Math.floor(Math.random() * (2 - 0 + 1) + 0)]}&teamsay=-1`

                await axios.post(chatUrl, chatUrlencoded, config) 
                await interaction.followUp({
                    content: message
                });
            } else {
                const message = `${input.value} could not be found in the database`
                const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
                const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
                await axios.post(chatUrl, chatUrlencoded, config)
                await interaction.followUp({
                    content: message
                });
            }
        }

    }
};