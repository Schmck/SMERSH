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

export const GambleCommand: Command = {
    name: "gamble",
    aliases: [],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    run: async (commandBus: CommandBus, caller: PlayerSearchReport, player: PlayerInfo, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
            },
        }


        if (player || typeof parseInt(name, 10) !== 'number') {
            const message = `please use a valid amount!`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        }

        if (caller && caller.Riksdaler) {
            const riksdaler = name ? parseInt(name) : caller.Riksdaler
            const gamble = Math.floor(Math.random() * 32) > 28 ? riksdaler * 2 : 0

            if (reason) {
                caller.Riksdaler += gamble;
            } else {
                caller.Riksdaler = gamble;
            }


            const message = gamble ? `you have won ${gamble}, you now have ${caller.Riksdaler} Riksdaler!` : 'you lost all your Riksdaler :/'
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`


            await SearchClient.Update(caller);
            await axios.post(chatUrl, chatUrlencoded, config)


        } else {
            const message = `${caller.Name} has no Riksdaler :/`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        }

    }
};