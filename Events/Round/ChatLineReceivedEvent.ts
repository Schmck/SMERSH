import { Guid } from "guid-typescript";
import { Event } from '../'

export class ChatLineReceivedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date, line: string) {
        super(id)
        this.MapId = mapId;
        this.Date = date;
        this.Line = line;
    }

    public readonly MapId: Guid

    public readonly Date: Date;

    public readonly Line: string;
}