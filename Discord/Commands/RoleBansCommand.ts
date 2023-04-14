import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Framework/Command"
import { SearchClient } from '../../Elastic'
import { PlayerSearchReport } from '../../Reports/Entities/player'
import { PolicySearchReport } from '../../Reports/Entities/policy';
import { Utils } from '../Framework'
import { Action } from "../../SMERSH/ValueObjects/player";

export const RoleBansCommand: Command = {
    name: "rolebans",
    description: "show an overview of all rolebanned players",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const count = await SearchClient.Count<PolicySearchReport>(PolicySearchReport)
        const bans = await SearchClient.Search(PolicySearchReport, {
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
                        }
                    ]
                }
            },
            "size": count.count
        })

        if (bans.length) {
            const roleBannedPlayers = Utils.generateRoleBanTable(bans)
           
            if (roleBannedPlayers.length > 20) {
                let roleBanList = roleBannedPlayers.reduce((resultArray, item, index) => {
                    const chunkIndex = Math.floor(index / 20)

                    if (!resultArray[chunkIndex]) {
                        resultArray[chunkIndex] = [] // start a new chunk
                    }

                    resultArray[chunkIndex].push(item)

                    return resultArray
                }, [])
                let lists = []
                roleBanList.forEach(roleBan => {
                    let list = `\n${roleBan.join('\n')}`
                    lists.push(list)
                })


                lists.forEach(msg =>
                    interaction.followUp({
                        ephemeral: true,
                        content: `\`\`\`prolog\n${msg}\`\`\``
                    })
                )
            } else {
                let lines = `\n${roleBannedPlayers.join('\n')}`
                if (lines.length > 1900) {
                    const messages = lines.match(/(.|[\r\n]){1,1902}/g)

                    messages.every(msg =>
                        interaction.followUp({
                            ephemeral: true,
                            content: `\`\`\`prolog\n${msg}\`\`\``
                        })
                    )
                } else {
                    interaction.followUp({
                        ephemeral: true,
                        content: `\`\`\`prolog\n${lines}\`\`\``
                    })
                }
            }

        } else {
            await interaction.followUp({
                ephemeral: true,
                content: `could not find any role bans in the database`
            });
        } 

            
        
    }
};