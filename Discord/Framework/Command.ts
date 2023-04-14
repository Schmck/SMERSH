import {
    CommandInteraction,
    ChatInputApplicationCommandData,
    AutocompleteInteraction,
    Client,
} from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;

    autocomplete?:(client: Client, interaction: AutocompleteInteraction) => Promise<void>;

    name: string;

    description: string;
}