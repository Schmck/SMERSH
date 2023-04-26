import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteFocusedOption, AutocompleteInteraction, EmbedType } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { Client, Utils } from '../Framework'
import { Role, Team } from "../../SMERSH/ValueObjects";
import { PlayerQuery } from "../../Services/WebAdmin/Queries";
import { ApplyDiscordRoleCommand, ApplyRoleBanCommand } from "../../Commands/Player";
import { Guid } from "guid-typescript";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { PlayerInfo } from "../../Services/WebAdmin/Models";
import { Commands } from './'

export const HelpCommand: Command = {
    name: "help",
    description: "show an overview of the available commands for each role",
    permissions: [DiscordRole.SmershAgent, DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'role',
            'description': 'pick a role, any role',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: DiscordRole.getAll<DiscordRole>().map(role => {
                return { name: role.DisplayName, value: role.DisplayName }
            }),
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const role = DiscordRole.fromDisplayName(interaction.options.get('role').value.toString());
        const commands = Commands.filter(command => { 
            return command.permissions.includes(role)
        })

        const fields: List<{ name: string, value: string, inline: boolean }> = commands.map(command => {
            const row = []

            if (command.name) {
                row.push({name: `/${command.name}`, value: command.description, inline: false})
            }

            if (command.options && command.options.length) {
                command.options.forEach(option => {
                    row.push({ name: option.name, value: option.description, inline: true })
                })
            }
            row.push({ name: '\u200B', value: '\u200B', inline: false })


            return row
        }).flat() as List<{ name: string, value: string, inline: boolean }>

        if (fields.length > 25) {
            const commandNames = Commands.map(command => command.name)
            await interaction.followUp({
                embeds: [{
                    title: `${role.DisplayName} Commands`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields: fields.slice(0, fields.findLastIndex((f, i) => commandNames.includes(f.name.slice(1)) && i >= 20 && i <= 25)),

                }]
            });

            for (let index = 25; index <= fields.length; index += 25) {
                await interaction.followUp({
                    embeds: [{
                        title: `${role.DisplayName} Commands`,
                        type: EmbedType.Rich,
                        color: 12370112,
                        fields: fields.slice(fields.findLastIndex((f, i) => commandNames.includes(f.name.slice(1)) && i >= (index - 5) && i <= index), fields.findLastIndex((f, i) => commandNames.includes(f.name.slice(1)) && i >= (index + 25 - 5) && i <= (index + 25))),
                    }]
                });
            }

        } else {
            await interaction.followUp({
                embeds: [{
                    title: `${role.DisplayName} Commands`,
                    type: EmbedType.Rich,
                    color: 12370112,
                    fields,

                }]
            });
        }
    }
};

interface List<T> extends Array<T> {
    findLastIndex(
        predicate: (value: T, index: number, obj: T[]) => unknown,
        thisArg?: any
    ): number
}