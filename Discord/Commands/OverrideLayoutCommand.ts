import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, Application, AutocompleteInteraction } from "discord.js";
import { Client, Utils } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ChangeLayoutRequirementsCommand } from '../../Commands/Layout'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../..//Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { PlayersRoute } from '../../Services/WebAdmin/Routes';
import { LayoutQuery, PlayerQuery } from '../../Services/WebAdmin/Queries'
import { LayoutSearchReport } from "../../Reports/Entities/layout";

export const OverrideLayoutCommand: Command = {
    name: "override",
    description: "override the active layout for a time",
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
        {
            name: 'duration',
            description: '(minutes) how long the layout should be active',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
     
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const name = interaction.options.get('name');
        let duration = parseInt(interaction.options.get('duration')?.value.toString(), 10);
        const layout = (await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
            "query": {
                match: {
                    "Name": name.value
                }
            }
        })).shift()

        const addMinutes = (date, minutes) => {
            const newDate = new Date(date)
            newDate.setMinutes(newDate.getMinutes() + minutes);
            return newDate;
        }

        if (duration) { 
            let date = new Date();
            date = addMinutes(date, duration)
            const override = {
                date,
                layout,
            }

            global.override = override;
            await interaction.followUp({
                ephemeral: true,
                content: `enforcing the ${name.value} layout  for the next ${duration} minutes`
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find the ${name.value} layout`
            });
        }



    }
};