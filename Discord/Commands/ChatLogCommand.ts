import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Client, Utils } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action } from "../../SMERSH/ValueObjects/player";
import { Api } from '../..//Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery } from '../../Services/WebAdmin/Queries'
import { RoundSearchReport } from "../../Reports/Entities/round";

export const ChatLogCommand: Command = {
    name: "chatlog",
    description: "search the SMERSH database for chatlogs",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String
        },
    ],
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
                ]
            })

            const lines = rounds.map(round => {
                const filtered = round.Lines.filter(line => line.username === player.Name).sort((lineA, lineB) => new Date(lineA.timestamp).getTime() - new Date(lineB.timestamp).getTime())
                return filtered.map(line => Utils.generateChatLine(line))
            }).flat()

            if (lines.join('\n').length > 1900) {
                //const file = await (new Blob([lines.join('\n')], { type: "text/plain", endings: 'native' })).arrayBuffer()
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