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
import { Action } from "../../SMERSH/ValueObjects/player";
import { PlayerInfo } from "../../Services/WebAdmin/Models";
import { PlayerRoundSearchReport } from "../../Reports/Entities/round/playerRound";
import { stat } from "fs";


export const RankingsCommand: Command = {
    name: "rankings",
    description: "shows an overview of the best player of the last month for each role",
    type: ApplicationCommandType.ChatInput,
    options: [],
    
    run: async (client: Client, interaction: CommandInteraction) => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const roles = Role.getAll<Role>()
        let stats: Record<number, Record<string, { KD: Record<string, number>, PlayerId: string, rounds: number }>> = []

        for (let role of roles) {
            const stat = await generateStats(role, firstDay, lastDay)
            stats[role.Value] = stat
        }

        let statistics: Record<number, { attacking: { KD: number, playerId: string }, defending: { KD: number, playerId: string } }> = Object.keys(stats).reduce((rankings, r) => {
            const role = Role.fromValue<Role>(parseInt(r))
            const players = stats[role.Value]
            const thebest = Object.keys(players).reduce((leaderboard, playerId) => {
                const player = players[playerId]

                if (player.rounds > 10) {
                    if (leaderboard.attacking.KD) {
                        if (leaderboard.attacking.KD < player.KD.attacking) {
                            leaderboard.attacking.KD = player.KD.attacking
                            leaderboard.attacking.playerId = player.PlayerId
                        }
                    } else {
                        leaderboard.attacking.KD = player.KD.attacking
                        leaderboard.attacking.playerId = player.PlayerId
                    }

                    if (leaderboard.defending.KD) {
                        if (leaderboard.defending.KD < player.KD.defending) {
                            leaderboard.defending.KD = player.KD.defending
                            leaderboard.defending.playerId = player.PlayerId
                        }
                    } else {
                        leaderboard.defending.KD = player.KD.defending
                        leaderboard.defending.playerId = player.PlayerId
                    }
                }


                return leaderboard

            }, {
                attacking: { KD: 0, playerId: "" },
                defending: { KD: 0, playerId: "" }
            })

            return {
                ...rankings,
                [role.Value]: thebest,
            };
        }, {})

        const playerIds = Object.keys(statistics).map(r => {
            const role = parseInt(r)
            const players = [...new Set(Object.values(statistics).map(stat => [stat.attacking.playerId, stat.defending.playerId]).flat())]
            return players
        }).flat()

        const players = (await Promise.all(playerIds.map(playerId => SearchClient.Get(playerId as any as Guid, PlayerSearchReport)))).filter(f => f)
        const fields = Object.keys(statistics).map(r => {
            const role = Role.fromValue(parseInt(r))
            const ranking = statistics[role.Value]
            const row = []

            if ((ranking.attacking && ranking.attacking.KD) || (ranking.defending && ranking.defending.KD)) {
                row.push({ name: role.DisplayName, value: '', inline: false })
            }

            if (ranking.attacking && ranking.attacking.KD) {
                const player = players.find(player => player.Id === ranking.attacking.playerId);
                if (player) {
                    row.push({ name: 'Attacking', value: `${player.Name}`, inline: true });
                }
            }

            if (ranking.defending && ranking.defending.KD) {
                const player = players.find(player => player.Id === ranking.defending.playerId);
                if (player) {
                    row.push({ name: '\u200B', value: '\u200B', inline: true }, { name: 'Defending', value: `${player.Name}`, inline: true });
                }
            }

            if (ranking.attacking && ranking.attacking.KD) {
                row.push({ name: 'K/D', value: ranking.attacking.KD.toFixed(2).toString(), inline: true }, { name: '\u200B', value: '\u200B', inline: true });
            }

            if (ranking.defending && ranking.defending.KD) {
                row.push({ name: 'K/D', value: ranking.defending.KD.toFixed(2).toString(), inline: true }, { name: '\u200B', value: '\u200B', inline: false });
            }
            return row
        }).flat().filter(f => f)


        if (fields.length > 25) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [{
                    title: `[${date.toLocaleString('default', { month: 'long' })}] Rankings`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields: fields.slice(0, fields.findIndex((f, i) => f.name === '\u200B' && i >= 20)),

                }]
            });

            await interaction.followUp({
                ephemeral: true,
                embeds: [{
                    title: `[${date.toLocaleString('default', { month: 'long' })}] Rankings`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields: fields.slice(fields.findIndex((f, i) => f.name === '\u200B' && i >= 20)),

                }]
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                embeds: [{
                    title: `[${date.toLocaleString('default', { month: 'long' })}] Rankings`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields,

                }]
            });
        }

        

    }
}


async function generateStats(role: Role, firstDay: Date, lastDay: Date): Promise<Record<string, { KD: Record<string, number>, PlayerId: string, rounds: number }>> {
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

  return stats
}

function percentage(partialValue, totalValue) {
    if (!totalValue) {
        return partialValue * 100
    }

    if (!partialValue && !totalValue) {
        return 0
    }
    return (100 / totalValue) * partialValue;
}