import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, Application } from "discord.js";
import { Client, Utils } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ChangeLayoutCommand } from '../../Commands/Layout'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../..//Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { PlayersRoute } from '../../Services/WebAdmin/Routes';
import { LayoutQuery, PlayerQuery } from '../../Services/WebAdmin/Queries'
import { LayoutSearchReport } from "../../Reports/Entities/layout";

export const SaveLayoutCommand: Command = {
    name: "save",
    description: "saves the layout that is currently on the server",
    permissions: [DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'name',
            description: 'name of the layout',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'regular',
                    value: 'regular'
                },
                {
                    name: 'stock',
                    value: 'stock'
                },
                {
                    name: 'fill',

                    value: 'fill'
                }
            ]
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const name = interaction.options.get('name');
        const layout = await LayoutQuery.Get();
        let layoutId: Guid;

        if (layout) {
            const report = (await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
                "query": {
                    match: {
                        "Name": name.value
                    }
                }
            })).shift()

            if (report) {
                layoutId = Guid.parse(report.Id)
            } else {
                layoutId = Guid.create()
            }
            await client.commandBus.execute(new ChangeLayoutCommand(layoutId, name.value.toString(), layout))
            await interaction.followUp({
                ephemeral: true,
                content: `the ${name.value} layout has been saved`
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not parse the ${name.value} layout`
            });
        }
        
            

    }
};