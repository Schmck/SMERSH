import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Utils } from '../Framework'
import { PlayerQuery } from "../../Services/WebAdmin/Queries";

export const LookupCommand: Command = {
    name: "lookup",
    description: "search the SMERSH database for players",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'input',
        description: 'name or ID of player',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
    }],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        const players = await PlayerQuery.Get();
        if (players) {
            const choices = players.filter(player => !player.Bot && player.Id).map(player => { return { name: player.Playername, value: player.Id } })
            const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
            if (filtered.length) {
                interaction.respond(filtered.slice(0, 24))
            } else {
                const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
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
                if (players) {
                    const choices = players.map(player => { return { name: player.Name, value: player.Id } })
                    const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                    interaction.respond(filtered.slice(0, 24));
                }
            }
        } 
    },
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
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

        if (players.length) {
            let playerTable: string = await Utils.generatePlayerTable(players, false)
            await interaction.followUp({
                ephemeral: true,
                content: `\`\`\`prolog
                ${playerTable}
                \`\`\``,
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
    }
};