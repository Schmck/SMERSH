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
import { Client } from "../Framework";

export const MemesCommand: Command = {
    name: "memes",
    description: "memes",
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    run: async (client: Client, interaction: CommandInteraction) => {
        const axios = Api.axios();
        const env = process.env;
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
            },
        }
        const message = `TL call rockets on the enemy team!`
        const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
        const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
        await axios.post(chatUrl, chatUrlencoded, config)
        await interaction.followUp({
            content: message
        });

    }
};