import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteFocusedOption, AutocompleteInteraction, EmbedType } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Client, Utils } from '../Framework'
import { Role, Team } from "../../SMERSH/ValueObjects";
import { PlayerQuery } from "../../Services/WebAdmin/Queries";
import { ApplyRoleBanCommand } from "../../Commands/Player";
import { Guid } from "guid-typescript";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { PlayerInfo } from "../../Services/WebAdmin/Models";
import { PlayerRoundSearchReport } from "../../Reports/Entities/round/playerRound";
import { stat } from "fs";


export const RankCommand: Command = {
    name: "rank",
    description: "shows an overview for a player of the last month for each role",
    permissions: [DiscordRole.Veteran, DiscordRole.SmershAgent, DiscordRole.Admin],
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
            name: 'role',
            description: 'pick a role, any role',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Role.getAll<Role>().map(role => {
                return { name: role.DisplayName, value: role.DisplayName }
            }),
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
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const input = interaction.options.get('input');
        const role = Role.fromDisplayName<Role>(interaction.options.get('role').value.toString());
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
        let stats: { KD: Record<string, number>, PlayerId: string, rounds: number } = await generateStats(input.value.toString(), role, firstDay, lastDay);


        if(!player) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [],
                content: `could not find ${input.name}/${input.value} in the database`
            });
        }

        if (!stats) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [],
                content: `could not find any rounds that ${player.Name} has played in as ${role.DisplayName}`
            });
            return
        }
        let statistics: { attacking: { KD: number, playerId: string }, defending: { KD: number, playerId: string } } = {
            attacking: {
                KD: stats.KD.attacking,
                playerId: stats.PlayerId,
            },
            defending: {
                KD: stats.KD.defending,
                playerId: stats.PlayerId,
            }
        }
        


        let fields: List<{ name: string, value: string, inline: boolean }> = []

        if ((statistics.attacking && statistics.attacking.KD) || (statistics.defending && statistics.defending.KD)) {
            fields.push({ name: role.DisplayName, value: '\u200B', inline: false })
        }

        if (statistics.attacking && statistics.attacking.KD) {
            fields.push({ name: 'Attacking', value: '', inline: true });
        }

        if (statistics.defending && statistics.defending.KD) {
            fields.push({ name: '\u200B', value: '\u200B', inline: true }, { name: 'Defending', value: '', inline: true });
        }

        if (statistics.attacking && statistics.attacking.KD) {
            fields.push({ name: 'K/D', value: statistics.attacking.KD.toFixed(2).toString(), inline: true }, { name: '\u200B', value: '\u200B', inline: true });
        }

        if (statistics.defending && statistics.defending.KD) {
            fields.push({ name: 'K/D', value: statistics.defending.KD.toFixed(2).toString(), inline: true }, { name: '\u200B', value: '\u200B', inline: false });
        }
        
        
        fields = fields.flat().filter(f => f) as List<{ name: string, value: string, inline: boolean }>


        if (fields.length > 25) {
            const roleNames = Role.getAll<Role>().map(role => role.DisplayName);
            await interaction.followUp({
                embeds: [{
                    title: `[${date.toLocaleString('default', { month: 'long' })}] ${player.Name}`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields: fields.slice(0, fields.findLastIndex((f, i) => roleNames.includes(f.name) && i >= 20 && i <= 25)),

                }]
            });

            for (let index = 25; index <= fields.length; index += 25) {
                await interaction.followUp({
                    embeds: [{
                        title: `[${date.toLocaleString('default', { month: 'long' })}] ${player.Name}`,
                        type: EmbedType.Rich,
                        color: 12370112,
                        fields: fields.slice(fields.findLastIndex((f, i) => roleNames.includes(f.name) && i >= (index - 5) && i <= index), fields.findLastIndex((f, i) => roleNames.includes(f.name) && i >= (index + 25 - 5) && i <= (index + 25))),
                    }]
                });
            }

        } else {
            await interaction.followUp({
                embeds: [{
                    title: `[${date.toLocaleString('default', { month: 'long' })}] ${player.Name}`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields,

                }]
            });
        }
    }
}


async function generateStats(playerId: string, role: Role, firstDay: Date, lastDay: Date): Promise<{ KD: Record<string, number>, PlayerId: string, rounds: number }> {
    const playerRounds = await SearchClient.Search<PlayerRoundSearchReport>(PlayerRoundSearchReport, {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "Role": role.Value
                        }
                    },
                    {
                        "match": {
                            "PlayerId": playerId
                        }
                    },
                    {
                        "range": {
                            "Date": {
                                "gte": firstDay.toISOString(),
                                "lte": lastDay.toISOString()
                            }
                        }
                    }
                ]
            }
        },
        "size": 10000
    }) ?? []
    const players = playerRounds.reduce((stats, round) => {
        let fields = { ...stats }

        if (fields[round.PlayerId]) {
            fields[round.PlayerId] = [...fields[round.PlayerId], round]
        } else {
            fields[round.PlayerId] = [round]
        }
        return fields
    }, {})

    const stats = Object.keys(players).reduce((stats, playerId) => {
        let fields = { ...stats }

        fields[playerId] = fields[playerId].reduce((stat, round, i, self) => {
            let side = round.Attacking ? 'attacking' : 'defending'
            let rounds = {
                ...stat,
                KD: {
                    ...stat.KD,
                    [side]: stat.KD && stat.KD[side] ? stat.KD[side] + (percentage(round.Kills, round.Deaths) / 100) : percentage(round.Kills, round.Deaths) / 100,
                },
                PlayerId: round.PlayerId
            }

            if (i + 1 === self.length) {
                //console.log(fields, self.filter(r => r.Attacking).length)
                return {
                    ...rounds,
                    KD: {
                        attacking: (rounds.KD.attacking / self.filter(r => r.Attacking).length) || 0,
                        defending: (rounds.KD.defending / self.filter(r => !r.Attacking).length) || 0
                    },
                    rounds: self.length
                }
            }
            return rounds
        }, {})
        return fields
    }, players)

    return stats[playerId]
}

function percentage(partialValue, totalValue) {
    if (!partialValue && !totalValue) {
        return 0
    }
    if (!totalValue) {
        return partialValue * 100
    }
    return (100 / totalValue) * partialValue;
}

interface List<T> extends Array<T> {
    findLastIndex(
        predicate: (value: T, index: number, obj: T[]) => unknown,
        thisArg?: any
    ): number
}