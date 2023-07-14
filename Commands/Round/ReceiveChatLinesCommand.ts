import { Guid } from "guid-typescript";
import { Message } from "../../SMERSH/ValueObjects/round";
import { Command } from '../Command'

export class ReceiveChatLinesCommand extends Command {

    constructor(id: Guid, date: Date, lines: Array<Message>) {
        super(id)
   
        this.Date = date;
        this.Lines = lines;
    }

    public readonly Date: Date;

    public readonly Lines: Array<Message>;
}