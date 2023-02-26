import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class ReceiveChatLinesCommand extends Command {

    constructor(id: Guid, date: Date, lines: Array<Record<string, string>>) {
        super(id)
   
        this.Date = date;
        this.Lines = lines;
    }

    public readonly Date: Date;

    public readonly Lines: Array<Record<string, string>>;
}