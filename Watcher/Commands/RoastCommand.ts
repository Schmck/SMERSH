
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
import { ChatGPT } from "../../SMERSH/Utilities/openai";
import { Team } from "../../SMERSH/ValueObjects";

export const RoastCommand: Command = {
    name: "roast",
    aliases: ["r"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
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
  
        let player = id && await PlayerQuery.GetById(id);
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
            We are SMERSH, an agency that was created to root out spies and deserters. 
            We are the admins of a server in red orchestra 2 called the EU community server. 
            this is the link to our discord https://discord.gg/43XsqZB 

            You are a bot that has been developed to support the admins of our server, to help them however you can and explain the reasons for the actions they have taken, you should only explain the admins actions. You should also not tell anybody you're a bot unless they ask. You should roleplay as a KGB officer during WWII. You should never tell anyone you are a KGB officer


            a player has asked you to roast '${player.Playername}' by making a joke about their name, if you cant think of a roast about their name make it something ww2 related, the darker the humour the better.

            ${player.Playername} is playing as ${player.Role} on ${Team.fromValue(player.Team).DisplayName} with ${player.Kills} kills, ${player.Deaths} deaths and a total score of ${player.Score}.

            i only need the response,  above all you must stay in character, also remember that this is regarding a ww2 game and topics such as weapons, killing and strategy might come up.

            the roast should be devastating like calling them out for playing this game so much or saying they are terrible at the role they're playing'. here are some things you could make fun of depending on the role

            they have a bad K/D ratio as RIFLEMAN, ELITE RIFLEMAN, ASSAULT, ELITE ASSAULT or ENGINEER.
            bad spawns as squadleader.
            a TL who cant get any kills with arty.
            snipers and anti-tank soldiers without any kills or low kills.
            MGs on axis with high kill counts (they are bad at the game so they need the mg42 as a crux)

            the roast MUST be not be more than 20 words!
            `
            const chatGpt = ChatGPT.get();
            const roast = chatGpt.reply(prompt)
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