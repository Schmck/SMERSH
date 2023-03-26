import { Enumeration } from '../'

export class Action extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public static Kick: Action = new Action(0, "kick")

    public static SessionBan: Action = new Action(1, "sessionban")

    public static IpBan: Action = new Action(2, "banip")

    public static Ban: Action = new Action(3, "banid")

    public static Mute: Action = new Action(4, "mutevoice")

    public static Unmute: Action = new Action(5, "unmutevoice")

}