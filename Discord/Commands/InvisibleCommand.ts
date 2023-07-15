import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteFocusedOption, AutocompleteInteraction } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Client, Utils } from '../Framework'
import { Role, Team } from "../../SMERSH/ValueObjects";
import { PlayerQuery } from "../../Services/WebAdmin/Queries";
import { ApplyDiscordRoleCommand, ApplyRoleBanCommand, ChangeVisibilityCommand } from "../../Commands/Player";
import { Guid } from "guid-typescript";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { PlayerInfo } from "../../Services/WebAdmin/Models";


export const InvisibleCommand: Command = {
    name: "invisible",
    description: "turn off the admin response in game for a specific user",
    permissions: [DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'invisible',
            'description': 'true or false',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'true', value: 'true'
                },
                {
                    name: 'false', value: 'false'
                }
            ]
        },
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        if (focusedValue.value) {
            const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                query: {
                    regexp: {
                        "Name": {
                            "value": `.*${focusedValue.value}.*`,
                            "flags": "ALL",
                            "case_insensitive": true
                        }
                    },
                },
                size: 24,
            })
            if (players) {
                const choices = players.map(player => { return { name: player.Name, value: player.Id } })
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                interaction.respond(filtered.slice(0, 24));
            }
        }
    },

    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        const invisible = interaction.options.get('invisible').value === 'true' ? true : false
        let match
        let regexp

        if (input && typeof (input.value) === 'string') {
            if (input.value.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                match = {
                    "Id": input.value
                }
            } else if (input.value.match(/[A-Z0-9]{9,10}/)) {
                match = {
                    "Id": `0x0110000${input.value}`
                }
            } else {
                regexp = {
                    "Name": {
                        "value": `.*${input.value}.*`,
                        "flags": "ALL",
                        "case_insensitive": true
                    }
                }
            }
        }



        const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
            "query": {
                match,
                regexp
            }
        })

        if (players.length > 1) {
            let playerTable: string = await Utils.generatePlayerTable(players, false)
            await interaction.followUp({
                ephemeral: true,
                content: `\`\`\`prolog
                ${playerTable}
                \`\`\``,
            });
            return;
        } else if (players.length) {
            const player = players.shift();


            client.commandBus.execute(new ChangeVisibilityCommand(player.Id as any, invisible))

            await interaction.followUp({
                ephemeral: true,
                content: `${player.Name} is now invisible`
            });

        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
    }
};