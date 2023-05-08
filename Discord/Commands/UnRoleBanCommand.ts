import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Client, Utils } from '../Framework'
import { Role, Team } from "../../SMERSH/ValueObjects";
import { PlayerQuery } from "../../Services/WebAdmin/Queries";
import { ApplyRoleBanCommand, LiftRoleBanCommand } from "../../Commands/Player";
import { Guid } from "guid-typescript";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Policy } from "../../Reports/Entities";


export const UnRoleBanCommand: Command = {
    name: "unroleban",
    description: "remove role ban from player",
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
            name: 'role',
            'description': 'pick a role, any role',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Role.getAll<Role>().map(role => {
                return { name: role.DisplayName, value: role.DisplayName }
            }),
        },
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        const query: any = {
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
                    }
                ]
            }

        }
        if (focusedValue.value) {
            query.bool.must.push({
                "regexp": {
                    "Name": {
                        "value": `.*${focusedValue.value}.*`,
                        "flags": "ALL",
                        "case_insensitive": true
                    }
                }
            })
        }
        const policies = await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
            query,
            "size": 24,
        })
        if (policies) {
            const choices = policies.map(policy => { return { name: policy.Name, value: policy.Id } })
            const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
            interaction.respond(filtered.slice(0, 24));
        }
    },
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        const role = interaction.options.get('role');
        const policyId = Guid.parse(input.value.toString())

        if (!policyId) {
            await interaction.followUp({
                ephemeral: true,
                content: `Please use the autocomplete instead.`
            });
            return;
        }

        const roleBan = await SearchClient.Get<PolicySearchReport>(policyId, PolicySearchReport)

        client.commandBus.execute(new LiftRoleBanCommand(policyId, Role.fromDisplayName<Role>(role.value.toString()).Value))

        await interaction.followUp({
            ephemeral: true,
            content: `removed ${roleBan.Name} from the role ban list`
        });

    }
};