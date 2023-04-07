import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Utils } from '../Framework'

export const LookupCommand: Command = {
    name: "lookup",
    description: "search the SMERSH database for players",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'input',
        description: 'name or ID of player',
        type: ApplicationCommandOptionType.String
    }],
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        let match

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
                match = {
                    "Name": `.*${input.value}.*`
                }
            }
        }

       

        const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
            "query": {
               match
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
        }
    }
};