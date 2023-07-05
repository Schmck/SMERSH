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

export const PimPamPumCommand: Command = {
    name: "pimpampum",
    aliases: ["pim", "pam", "pum", "pimpam"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    run: async (commandBus: CommandBus, callerId: string, caller: string, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Cookie": `authcred="${env["AUTHCRED"]}"`
            },
        }
        const message = `pim pam PUUUM!`
        const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
        const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
        await axios.post(chatUrl, chatUrlencoded, config)

    }
};