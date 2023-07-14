import { Guid } from "guid-typescript";
import { Event } from '../'
import { Message } from "../../SMERSH/ValueObjects/round";

export class ChatLinesReceivedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date, lines: Array<Message>) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
        this.Lines = lines;
    }

    public readonly MapId: Guid;

    public readonly Lines: Array<Message>
}