import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Client } from '../Framework'
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { Api } from '../../Web/Framework'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { PlayersRoute, PolicyRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery, PolicyQuery } from '../../Services/WebAdmin/Queries';
import { ApplyPolicyCommand, LiftMuteCommand } from '../../Commands/Player'
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { Utils } from '../Framework'
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Guid } from "guid-typescript";
import { stringify } from 'querystring'
import qs from 'qs'
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { SteamBot } from "../../SMERSH/Utilities/steam";


export const MessageCommand: Command = {
    name: "message",
    description: "message a player on steam",
    permissions: [DiscordRole.SmershAgent, DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'message',
            description: 'message for the player',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        if (focusedValue.value) {
            const policies = await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "IsActive": true
                                }
                            },
                            {
                                "regexp": {
                                    "Name": {
                                        "value": `.*${focusedValue.value}.*`,
                                        "flags": "ALL",
                                        "case_insensitive": true
                                    }
                                }
                            }
                        ]
                    }
                },
                "size": 24,
            })
            if (policies) {
                const choices = policies.map(policy => { return { name: policy.Name, value: policy.Id } })
                const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase()) || choice.name.toLowerCase().includes(focusedValue.value.toLowerCase()))
                interaction.respond(filtered.slice(0, 24));
            }
        }
    },
    run: async (client: Client, interaction: CommandInteraction) => {
        const input = interaction.options.get('input');
        const message = interaction.options.get('message');
        const policyId = Guid.parse(input.value.toString())
        if (!policyId) {
            await interaction.followUp({
                ephemeral: true,
                content: `Please use the autocomplete instead.`
            });
            return;
        }

        const policy = await SearchClient.Get<PolicySearchReport>(policyId, PolicySearchReport)


        if (policy) {
            SteamBot.get().sendMessageToFriend(policy.PlayerId, message.value.toString())

            await interaction.followUp({
                ephemeral: true,
                content: `sent a message to ${policy.Name}`
            });
        }
    }
}
