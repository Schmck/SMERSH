import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Client, Utils } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../..//Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery } from '../../Services/WebAdmin/Queries'
import { RoundSearchReport } from "../../Reports/Entities/round";

export const ChatLogCommand: Command = {
    name: "chatlog",
    description: "search the SMERSH database for chatlogs",
    permissions: [DiscordRole.SmershAgent, DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
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

        if (players.length > 1) {
            let playerTable: string = await Utils.generatePlayerTable(players, false)
            await interaction.followUp({
                ephemeral: true,
                content: `\`\`\`prolog
                ${playerTable}
                \`\`\``,
            });
            return;
        }

        const player = players.shift();

        if (player) {
            const rounds = await SearchClient.Search<RoundSearchReport>(RoundSearchReport, {
                "query": {
                    "nested": {
                        "path": "Lines",
                        "query": {
                            "match": {
                                "Lines.id": player.Id
                            }
                        }
                    }
                },
                "sort": [
                    {
                        "Date": {
                            "order": "desc"
                        }
                    }
                ],
                "size": 1000,
            })

            const lines = rounds.map(round => {
                const filtered = round.Lines.filter(line => line.id === player.Id).sort((lineA, lineB) => new Date(lineB.timestamp).getTime() - new Date(lineA.timestamp).getTime())
                return filtered.map(line => Utils.generateChatLine(line))
            }).flat()

            if (lines.join('\n').length > 1900) {
                const file = Buffer.from(lines.join('\n'))
                await interaction.followUp({
                    files: [{
                        attachment: file,
                        name: `${player.Id}.txt`
                    }],
                    ephemeral: true
                });
            } else if (lines.length) {
                await interaction.followUp({
                    ephemeral: true,
                    content: `\`\`\`diff\n${lines.join('\n')}
                \`\`\``
                });
            } else {
                await interaction.followUp({
                    ephemeral: true,
                    content: `could not find chat log for ${player.Name}`
                });
            }
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
        
    }
};