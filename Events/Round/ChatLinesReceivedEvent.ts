import { Guid } from "guid-typescript";
import { Event } from '../'

export class ChatLinesReceivedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date, lines: Array<Record<string, string>>) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
        this.Lines = lines;
    }

    public readonly MapId: Guid;

    public readonly Lines: Array<Record<string, string>>
}