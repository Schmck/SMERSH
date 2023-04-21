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


export const RolesCommand: Command = {
    name: "roles",
    description: "get an overview of which roles/teams/sides a player favours",
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
        //const reason = interaction.options.get('reason');
        //const role = interaction.options.get('role');
        //const team = interaction.options.get('team');
        //const side = interaction.options.get('side');
        let match

        if (input && typeof (input.value) === 'string') {
            if (input.value.match(/0x011[0]{4}[A-Z0-9]{9,10}/)) {
                match = {
                    "PlayerId": input.value
                }
            } else if (input.value.match(/[A-Z0-9]{9,10}/)) {
                match = {
                    "PlayerId": `0x0110000${input.value}`
                }
            } else {
                await interaction.followUp({
                    ephemeral: true,
                    content: `Please use the autocomplete instead`
                });
            }
        }


        const player = await SearchClient.Get(input.value as any as Guid, PlayerSearchReport)
        const playerRounds = await SearchClient.Search<PlayerRoundSearchReport>(PlayerRoundSearchReport, {
            "query": {
                match
            }
        })

        if (playerRounds.length) {
            const stats = generateStats(playerRounds)
            const fields = Object.keys(stats).map(stat => {
                const field = stats[stat]

                if (stat === 'Roles') {
                   return Object.keys(field).map(r => {
                        const role = Role.fromValue<Role>(parseInt(r))
                       const value = `${Math.round(field[r]) }%`
                        return { name: role.DisplayName, value, inline: true }
                    })
                }

                if (stat === 'Teams') {
                   return Object.keys(field).map(r => {
                        const team = Team.fromValue<Team>(parseInt(r))
                        const value = `${Math.round(field[r])}%`
                        return { name: team.DisplayName, value }
                    })
                }

                if (stat === 'Sides') {
                   return Object.keys(field).map(r => {
                        const side = r
                       const value = `${Math.round(field[r])}%`
                        return { name: side, value }
                    })
                }
            }).flat().flat().filter(f => f);
            await interaction.followUp({
                ephemeral: true,
                embeds: [{
                    title: `[${player.Id}]  ${player.Name}`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields,

                }]
            });

        } else if(player) {
            await interaction.followUp({
                ephemeral: true,
                embeds: [],
                content: `could not find ${player.Name} in the database`
            });
        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
    }
};

function generateStats(playerRounds: PlayerRoundSearchReport[]): { PlayerId: string, Roles: Record<number, number>, Sides: Record<string, number>, Teams: Record<number, number> } {
    return playerRounds.reduce((stats, round, i, self) => {
        let side = round.Attacking ? 'attacking' : 'defending';
        let fields = {
            ...stats,
            PlayerId: round.PlayerId,
            Roles: {
                ...stats.Roles,
                [round.Role]: stats.Roles[round.Role] ? stats.Roles[round.Role] + 1 : 1,
            },
            Teams: {
                ...stats.Teams,
                [round.Team]: stats.Teams[round.Team] ? stats.Teams[round.Team] + 1 : 1
            },
            Sides: {
                ...stats.Sides,
                [side]: stats.Sides[side] ? stats.Sides[side] + 1 : 1
            }
        }

        if (i + 1 === self.length) {
            const roles = Object.keys(fields.Roles).reduce((roles, role) => {
                return {
                    ...roles,
                    [role]: percentage(fields.Roles[role], playerRounds.length)
                }
            }, {})
            const teams = Object.keys(fields.Teams).reduce((teams, team) => {
                return {
                    ...teams,
                    [team]: percentage(fields.Teams[team], playerRounds.length)
                }
            }, {})
            const sides = Object.keys(fields.Sides).reduce((sides, side) => {
                return {
                    ...sides,
                    [side]: percentage(fields.Sides[side], playerRounds.length)
                }
            }, {})
            return {
                ...stats,
                Roles: roles,
                Teams: teams,
                Sides: sides,
            }
        }

        return fields
    }, {
        PlayerId: "",
        Roles: {},
        Teams: {},
        Sides: {},
    })
}

function percentage(partialValue, totalValue) {
    return (100 / totalValue) * partialValue;
}