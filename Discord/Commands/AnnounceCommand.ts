import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import { Client } from '../Framework'
import { Command } from "../Framework/Command"
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Guid } from "guid-typescript";
import { stringify } from 'querystring'
import qs from 'qs'
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { SteamBot } from "../../SMERSH/Utilities/steam";
import { hexToDec, decToHex } from 'hex2dec'


export const AnnounceCommand: Command = {
    name: "announce",
    description: "announce an event to all players that are friends with SMERSH on steam",
    permissions: [DiscordRole.SmershAgent, DiscordRole.Admin],
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'message',
            description: 'message for the player',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        const message = interaction.options.get('message');
        const friends = Object.keys(SteamBot.get().steam.myFriends)

        friends.forEach(friend => {
            const id = decToHex(friend)
            SteamBot.get().sendMessageToFriend(id, message.value.toString())
        })

        await interaction.followUp({
            ephemeral: true,
            content: `sent the following announcement: ${message.value.toString()}`
        });
    }
}
