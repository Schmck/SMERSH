import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class EndRoundCommand extends Command {

    constructor(id: Guid, date: Date, players: string[]) {
        super(id)

        this.Date = date;
        this.Players = players
    }

    public readonly Date: Date;

    public readonly Players: string[];

}