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
import { Action } from "../../SMERSH/ValueObjects/player";
import { Guid } from "guid-typescript";
import { stringify } from 'querystring'
import qs from 'qs'
import { PolicySearchReport } from "../../Reports/Entities/policy";


export const UnMuteCommand: Command = {
    name: "unmute",
    description: "unmute a player",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'input',
            description: 'name of player',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],
    autocomplete: async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
        const focusedValue = interaction.options.getFocused(true);
        if (focusedValue.value) {
            const policies = await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    IsActive: true
                                }
                            },
                            {
                                match: {
                                    Action: Action.Mute.DisplayName
                                }
                            }
                        ]

                    },
                    regexp: {
                        Name: {
                            value: `.*${focusedValue.value}.*`,
                            flags: "ALL",
                            case_insensitive: true
                        }
                    }
                },
                size: 24,
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

        let match;
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

        let num;

        num = '0'

        const policy = (await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
            "query": {
                match,
                regexp,
            }
        })).shift()

        if (policy) {
            await client.commandBus.execute(new LiftMuteCommand(Guid.parse(policy.Id)))


            await interaction.followUp({
                ephemeral: true,
                content: `${policy.Name} was unmuted`
            });
        }
    }
}
