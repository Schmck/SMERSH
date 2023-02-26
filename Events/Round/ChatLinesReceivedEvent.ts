import { Guid } from "guid-typescript";
import { Event } from '../'

export class ChatLinesReceivedEvent extends Event {

    constructor(id: Guid, date: Date, lines: Array<Record<string, string>>) {
        super(id)
 
        this.Date = date;
        this.Lines = lines;
    }

    public readonly Date: Date;

    public readonly Lines: Array<Record<string, string>>
}