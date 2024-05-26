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

export const ShipItCommand: Command = {
    name: "shipit",
    description: 'the man, the myth, the legend',
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent, DiscordRole.Veteran, DiscordRole.Regular],
    run: async (client: Client, interaction: CommandInteraction) => {
        const axios = Api.axios();
        const env = JSON.parse(process.env.NODE_ENV['PARAMS']);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
            },
        }
        const messages = [`remember_meOW (RM): SNIPER BALLAS ON LEFT`, `Ship it holla ballas: TL pls call naval barrage#G:`, `Ship it holla ballas: i am new player let me play`]
        const message = messages[Math.floor(Math.random() * (2 - 0 + 1) + 0)]
        const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
        const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
        await axios.post(chatUrl, chatUrlencoded, config)
        await interaction.followUp({
            content: message
        });

    }
};