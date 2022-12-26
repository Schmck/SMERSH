import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
import { CommandInteraction, Client, Interaction } from "discord.js";
import { Commands } from '../Commands'


export class Listeners {
    public static log = new FileLogger(`./info-listeners.log`)


    public static onReady(client: Client): void {
        client.on('ready', async () => {
            if (!client.user || !client.application) {
                return;
            }
            await client.application.commands.set(Commands);
        })
    }

    public static onInteractionCreate(client: Client): void {
        client.on('interactionCreate', async (interaction: Interaction) => {
            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
                this.handleSlashCommand(client, interaction)
            }
        })
    }

    public static async handleSlashCommand(client: Client, interaction: CommandInteraction): Promise<void> {
        const slashCommand = Commands.find(c => c.name === interaction.commandName);
        if (!slashCommand) {
            interaction.followUp({ content: "An error has occurred" });
            return;
        }

        await interaction.deferReply();

        await slashCommand.run(client, interaction);
    }
}