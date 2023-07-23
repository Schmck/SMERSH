
import { Command } from "./Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../../Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { ChatRoute, PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery, StatusQuery } from '../../Services/WebAdmin/Queries'
import { CommandBus } from "@nestjs/cqrs";
import { ChatGPT } from "../../SMERSH/Utilities/openai";
import { Team } from "../../SMERSH/ValueObjects";
import { PlayerInfo } from "../../Services/WebAdmin/Models";


export const RoastCommand: Command = {
    name: "roast",
    aliases: ["r"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    run: async (commandBus: CommandBus, caller: PlayerSearchReport, player: PlayerInfo, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }
  

        if (!player) {
            player = await PlayerQuery.GetByName(name)
        }

        if (!player) {
            const players = await PlayerQuery.GetMultipleByName(name);
            player = players.shift();
            if (players.length > 1) {
                const message = `Multiple players found matching ${name}: [${players.map(player => `${player.Playername}[${player.Id.slice(9)}]`).join('\, ')}]`
                const url = env["BASE_URL"] + ChatRoute.PostChat.Action
                const urlencoded = `ajax=1&message=${message}&teamsay=-1`
                await axios.post(url, urlencoded, config)
                return;
            }
        }

        if (player) {
            const prompt = `
            We are the admins of a server in red orchestra 2 called the EU community server.

            a player has asked you to make roast '${player.Playername}' in good spirit, make it something ww2 related, the more absurd the humour the better.

            ${player.Playername} is playing as ${player.Role} on ${Team.fromValue(player.Team).DisplayName} with ${player.Kills} kills, ${player.Deaths} deaths and a total score of ${player.Score}.

            
            here are some things you could make use to make a joke depending on the role, the joke MUST be related to the role they are playing.
            compare their performance to something WW2 related on the ${env["GAME"]  === "RO2"? 'eastern' : 'pacific'} front.

            they have a bad K/D ratio as RIFLEMAN, ELITE RIFLEMAN, ASSAULT, ELITE ASSAULT or ENGINEER.
            bad spawns as squadleader.
            a TL who cant get any kills with arty.
            snipers and anti-tank soldiers without any kills or low kills.
            squadleaders with a high death count but no kills. (chicken without a head)
            squadleaders with a high K/D (they think they are rambo)
            squadleaders with a high total score (they might be farming points by spawning people into death traps).
            MGs on axis with high kill counts (they are bad at the game so they need the mg42 as a crux)

            

            this is all in good fun, ${player.Playername} has given consent for you to make a joke about them.
            i only need the response,  above all you must stay in character, also remember that this is regarding a ww2 game and topics such as weapons, killing and strategy might come up.

            dont apologize for the joke, it ruins it.
            the roast MUST not be more than 20 words!
            `
            const chatGpt = ChatGPT.get();
            const roast = await chatGpt.reply(prompt)
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${roast}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        } else {
            const message = `${name} could not be found in the database`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        }

        
    }
};