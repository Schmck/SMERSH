import { CommandBus } from "@nestjs/cqrs";
import { DiscordRole } from "../../SMERSH/ValueObjects/player";

export interface Command {
    run: (commandBus: CommandBus, ...args: any[]) => Promise<void>;

    name: string;

    aliases: string[]

    permissions: DiscordRole[]
}