import { Enumeration } from '../'
import { Guid } from "guid-typescript";

export class Team extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public static Axis: Team = new Team(0, "Axis")

    public static Allies : Team = new Team(1, "Allies")
}