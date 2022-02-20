import { Enumeration } from '../'
import { Guid } from "guid-typescript";

export class Team extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public Axis: Team = new Team(0, "Axis")

    public Allies : Team = new Team(1, "Allies")
}