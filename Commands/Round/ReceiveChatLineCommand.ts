import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class ReceiveChatLineCommand extends Command {

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