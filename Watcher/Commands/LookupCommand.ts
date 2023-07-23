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
import { PlayerInfo } from "../../Services/WebAdmin/Models";

export const LookupCommand: Command = {
    name: "lookup",
    aliases: ["l"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent],
    run: async (commandBus: CommandBus, caller: PlayerSearchReport, player: PlayerInfo, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const url = env["BASE_URL"] + ChatRoute.PostChat.Action
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }
        let match
        let regexp


        if (player) {
            const urlencoded = `ajax=1&message=${player.Playername}[${player.Id.slice(9)}]&teamsay=-1`
            await axios.post(url, urlencoded, config);
            return;
        }

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
            },
            "size": 10,
        })
 

        if (players.length) {
            const playerIds = players.map(player => `${player.Name}[${player.Id.slice(9)}]`)
            playerIds.forEach(async playerId => {
                const urlencoded = `ajax=1&message=${playerId}&teamsay=-1`
                await axios.post(url, urlencoded, config)
            })
        } else {
            const message = `${name} could not be found in the database`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        }
        return;
    }
};