import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class ReceiveChatLinesCommand extends Command {

    constructor(id: Guid, mapId: Guid, date: Date, lines: string[]) {
        super(id)
        this.MapId = mapId;
        this.Date = date;
        this.Lines = lines;
    }

    public readonly MapId: Guid

    public readonly Date: Date;

    public readonly Lines: string[];
}