import { Enumeration } from '../'

export class DiscordRole extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public static Veteran: DiscordRole = new DiscordRole(0, "RO2 Veteran")

    public static SmershAgent: DiscordRole = new DiscordRole(1, "SMERSH Agent")

    public static Admin: DiscordRole = new DiscordRole(2, "Admin")



}