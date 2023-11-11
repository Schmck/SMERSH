import { Command } from "./Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { ApplyPolicyCommand, LiftMuteCommand } from '../../Commands/Player'
import { Guid } from "guid-typescript";
import { Action, DiscordRole } from "../../SMERSH/ValueObjects/player";
import { Api } from '../../Web/Framework';
import { AxiosRequestConfig } from 'axios';
import { ChatRoute, PlayersRoute } from '../../Services/WebAdmin/Routes';
import { PlayerQuery } from '../../Services/WebAdmin/Queries'
import { CommandBus } from "@nestjs/cqrs";
import { PolicySearchReport } from "../../Reports/Entities/policy";
import { PlayerInfo } from "../../Services/WebAdmin/Models";

export const UnMuteCommand: Command = {
    name: "unmute",
    aliases: ["um"],
    permissions: [DiscordRole.Admin, DiscordRole.SmershAgent],
    run: async (commandBus: CommandBus, caller: PlayerSearchReport, player: PlayerInfo, name: string, id: string, reason: string, duration: string) => {
        const axios = Api.axios();
        const env = JSON.parse(process.argv[process.argv.length - 1]);
        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
            },
        }
        let match;
        let regexp = {
            "Name": {
                "value": `.*${name}.*`,
                "flags": "ALL",
                "case_insensitive": true
            }
        }

        if (regexp) {
            if (!player) {
                const players = await SearchClient.Search<PlayerSearchReport>(PlayerSearchReport, {
                    "query": {
                        regexp
                    }
                })

                if (players.length > 1) {
                    const message = `Multiple players found matching ${name}: [${players.map(player => `${player.Name}[${player.Id.slice(9)}]`).join('\, ')}]`
                    const url = env["BASE_URL"] + ChatRoute.PostChat.Action
                    const urlencoded = `ajax=1&message=${message}&teamsay=-1`
                    await axios.post(url, urlencoded, config)
                    return;
                }
            }

            if (player) {
                match = {
                    "PlayerId": player.Id,
                }
            }
        }
        const policy = (await SearchClient.Search<PolicySearchReport>(PolicySearchReport, {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "IsActive": true
                            }
                        },
                        {
                            "match": {
                                "Action": Action.Mute.DisplayName
                            }
                        },
                        {
                            match
                        }
                    ]

                }
            },
        })).shift()

        if (policy) {
            await commandBus.execute(new LiftMuteCommand(Guid.parse(policy.Id)))

            if (caller && caller.Invisible) {
                return;
            } 

            const message = `${policy.Name} was unmuted`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        } else {
            const message = `${name} could not be found in the database`
            const chatUrl = env["BASE_URL"] + ChatRoute.PostChat.Action
            const chatUrlencoded = `ajax=1&message=${message}&teamsay=-1`
            await axios.post(chatUrl, chatUrlencoded, config)
        }
    }
};