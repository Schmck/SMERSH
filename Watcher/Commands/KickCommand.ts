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

export const KickCommand: Command = {
    name: "kick",
    aliases: ["k"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent],
    run: async (commandBus: CommandBus, caller: string, name: string, id: string, reason: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }
        let match
        let regexp

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

        if (players.length > 1) {
            const message = `Multiple players found matching ${name}: [${players.map(player => `${player.Name}[${player.Id.slice(9)}]`).join('\, ')}]`
            const url = env["BASE_URL"] + ChatRoute.PostChat.Action
            const urlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(url, urlencoded, config)
            return;
        }

        if (player) {
            const playa = await PlayerQuery.GetById(player.Id)
            const url = env["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
            const urlencoded = `ajax=1&action=kick&playerkey=${playa.PlayerKey}`

            await commandBus.execute(new ApplyPolicyCommand(Guid.create(), player.Id, env["COMMAND_CHANNEL_ID"], Action.Kick, player.Name, reason, new Date()))

            await axios.post(url, urlencoded, config)
            const message = `${player.Name} was kicked for ${reason}`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
            /*await interaction.followUp({
                ephemeral: true,
                content: 
            });*/
        } else {
            const playa = await PlayerQuery.GetByName(name)
            if (playa) {
                const url = env["BASE_URL"] + PlayersRoute.CondemnPlayer.Action
                const urlencoded = `ajax=1&action=kick&playerkey=${playa.PlayerKey}`
                await commandBus.execute(new ApplyPolicyCommand(Guid.create(), playa.UniqueID, env["COMMAND_CHANNEL_ID"], Action.Kick, playa.Playername, reason, new Date()))

                await axios.post(url, urlencoded, config)
                const message = `${player.Name} was kicked for ${reason ? reason : 'no reason'}`
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

    }
};