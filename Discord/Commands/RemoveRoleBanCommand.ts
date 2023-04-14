import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Client, Utils } from '../Framework'
import { Role, Team } from "../../SMERSH/ValueObjects";
import { PlayerQuery } from "../../Services/WebAdmin/Queries";
import { ApplyRoleBanCommand, LiftRoleBanCommand } from "../../Commands/Player";
import { Guid } from "guid-typescript";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { Action } from "../../SMERSH/ValueObjects/player";


export const RemoveRoleBanCommand: Command = {
    name: "roleban",
    description: "remove role ban from player",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'remove',
            description: 'remove',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: []
        },
        {
            name: 'input',
            description: 'name or ID of player',
            type: ApplicationCommandOptionType.String,
        },
    ],
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
                                    "Id": player.Id
                                }
                            }
                        ]
                    }
                },
            })).shift()

            if (roleBan) {
                policyId = Guid.parse(roleBan.Id);
            }

            client.commandBus.execute(new LiftRoleBanCommand(policyId))

            await interaction.followUp({
                ephemeral: true,
                content: `removed ${input.value} from the role ban list`
            });

        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find ${input.value} in the database`
            });
        }
    }
};