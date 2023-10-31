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

export const LayoutCommand: Command = {
    name: "layout",
    description: "change the requirements for when a layout should be active",
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
            name: 'minimum_player_count',
            description: 'minimum amount of players needed for the layout to be active',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'maximum_player_count',
            description: 'maximum amount of players needed for the layout to be active',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'start_time',
            description: 'when this layout should start being enforced',
            choices: [{ "name": "12am", "value": "0" }, { "name": "1am", "value": "1" }, { "name": "2am", "value": "2" }, { "name": "3am", "value": "3" }, { "name": "4am", "value": "4" }, { "name": "5am", "value": "5" }, { "name": "6am", "value": "6" }, { "name": "7am", "value": "7" }, { "name": "8am", "value": "8" }, { "name": "9am", "value": "9" }, { "name": "10am", "value": "10" }, { "name": "11am", "value": "11" }, { "name": "12pm", "value": "12" }, { "name": "1pm", "value": "13" }, { "name": "2pm", "value": "14" }, { "name": "3pm", "value": "15" }, { "name": "4pm", "value": "16" }, { "name": "5pm", "value": "17" }, { "name": "6pm", "value": "18" }, { "name": "7pm", "value": "19" }, { "name": "8pm", "value": "20" }, { "name": "9pm", "value": "21" }, { "name": "10pm", "value": "22" }, { "name": "11pm", "value": "23" }],
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'end_time',
            description: 'when this layout should stop being enforced',
            choices: [{ "name": "12am", "value": "0" }, { "name": "1am", "value": "1" }, { "name": "2am", "value": "2" }, { "name": "3am", "value": "3" }, { "name": "4am", "value": "4" }, { "name": "5am", "value": "5" }, { "name": "6am", "value": "6" }, { "name": "7am", "value": "7" }, { "name": "8am", "value": "8" }, { "name": "9am", "value": "9" }, { "name": "10am", "value": "10" }, { "name": "11am", "value": "11" }, { "name": "12pm", "value": "12" }, { "name": "1pm", "value": "13" }, { "name": "2pm", "value": "14" }, { "name": "3pm", "value": "15" }, { "name": "4pm", "value": "16" }, { "name": "5pm", "value": "17" }, { "name": "6pm", "value": "18" }, { "name": "7pm", "value": "19" }, { "name": "8pm", "value": "20" }, { "name": "9pm", "value": "21" }, { "name": "10pm", "value": "22" }, { "name": "11pm", "value": "23" }],
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'max_ping',
            description: 'Kicks any player that exceeds the ping limit, set to 0 to disable it',
            type: ApplicationCommandOptionType.Integer,
        }
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        if (focusedValue.value) {
            const layouts = await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
                query: {
                    regexp: {
                        "Name": {
                            "value": `.*${focusedValue.value}.*`,
                            "flags": "ALL",
                            "case_insensitive": true
                        }
                    }
                },
                size: 24,
            })
            if (layouts) {
                const choices = layouts.map(layout => { return { name: layout.Name, value: layout.Name } })
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                interaction.respond(filtered);
            }
        }
    },
    run: async (client: Client, interaction: CommandInteraction) => {
        const name = interaction.options.get('name');
        let minimumPlayerCount = interaction.options.get('minimum_player_count').value;
        let maximumPlayerCount = interaction.options.get('maximum_player_count').value;
        let startTime = interaction.options.get('start_time').value;
        let endTime = interaction.options.get('end_time').value;
        let maxPing = interaction.options.get('max_ping').value;
        const layout = (await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
            "query": {
                match: {
                    "Name": name.value
                }
            }
        })).shift()

      

        if (layout) {
            if (minimumPlayerCount === undefined || minimumPlayerCount === null) {
                minimumPlayerCount = layout.MinimumPlayerCount;
            } else {
                minimumPlayerCount = parseInt(minimumPlayerCount.toString())
            }

            if (maximumPlayerCount === undefined || maximumPlayerCount === null) {
                maximumPlayerCount = layout.MaximumPlayerCount;
            } else {
                maximumPlayerCount = parseInt(maximumPlayerCount.toString())
            }

            if (startTime === undefined || startTime === null) {
                startTime = layout.StartTime;
            } else {
                startTime = parseInt(startTime.toString())
            }

            if (endTime === undefined || endTime === null) {
                endTime = layout.EndTime;
            } else {
                endTime = parseInt(endTime.toString())
            }

            if (maxPing === undefined || maxPing === null) {
                maxPing = 0;
            } else {
                maxPing = parseInt(maxPing.toString())
            }

            
            await client.commandBus.execute(new ChangeLayoutRequirementsCommand(Guid.parse(layout.Id), minimumPlayerCount, maximumPlayerCount, startTime, endTime, maxPing))
            await interaction.followUp({
                ephemeral: true,
                content: `the requirements for the ${name.value} layout have been saved`
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find the ${name.value} layout`
            });
        }



    }
};