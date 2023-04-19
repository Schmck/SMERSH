import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteFocusedOption, AutocompleteInteraction } from "discord.js";
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


export const RoleBanCommand: Command = {
    name: "roleban",
    description: "dole out justice",
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
            name: 'reason',
            description: 'pick a reason, any reason',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'role',
            'description': 'pick a role, any role', 
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Role.getAll().map(role => {
                return { name: role.DisplayName, value: role.DisplayName }
            }),
        },
        {
            name: 'team',
            description: 'pick a team, any team',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Team.getAll().map(team => {
                return { name: team.DisplayName, value: team.DisplayName }
            }),

        },
        {
            name: 'side',
            description: 'pick a side, any side',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'attacking',
                    value: 'attacking'
                },
                {
                    name: 'defending',
                    value: 'defending'
                },
            ],

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
        const reason = interaction.options.get('reason');
        const role = interaction.options.get('role');
        const team = interaction.options.get('team');
        const side = interaction.options.get('side');
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
        } else if (players.length) {
            const player = players.shift();
            let policyId = Guid.create()

            const roleBan = (await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "Action": Action.RoleBan.DisplayName,
                                }
                            },
                            {
                                "match": {
                                    "IsActive": true
                                }
                            },
                            {
                                "match": {
                                    "PlayerId": player.Id
                                }
                            }
                        ]
                    }
                },
            })).shift()

            if (roleBan) {
                policyId = Guid.parse(roleBan.Id);
            }

            client.commandBus.execute(new ApplyRoleBanCommand(policyId, player.Id, interaction.channelId, player.Name, reason.value.toString(), Role.fromDisplayName<Role>(role.value.toString()), Team.fromDisplayName<Team>(team.value.toString()), side.value.toString(), new Date()))

            await interaction.followUp({
                ephemeral: true,
                content: `added ${player.Name} to the role ban list`
            });

        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
    }
};