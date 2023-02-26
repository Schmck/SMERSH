import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class StartRoundCommand extends Command {

    constructor(id: Guid, timeLimit: number, date: Date, players: string[]) {
        super(id)

        this.TimeLimit = timeLimit;
        this.Date = date;
        this.Players = players
    }

    public TimeLimit: number;

    public readonly Date: Date;

    public readonly Players: string[];

}