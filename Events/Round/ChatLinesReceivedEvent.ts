import { Guid } from "guid-typescript";

export class ChatLinesReceivedEvent {

    constructor(roundId: Guid, mapId: Guid, date: Date, chatLines: string[]) {
        this.RoundId = roundId;
        this.MapId = mapId;
        this.Date = date;
        this.ChatLines = chatLines;
    }

    public readonly RoundId: Guid

    public readonly MapId: Guid

    public readonly Date: Date;

    public readonly ChatLines: string[];
}