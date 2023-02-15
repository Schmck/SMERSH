import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { ChatLinesReceivedEvent } from '../Events/Round'

export class Round extends Domain {

    public MapId: Guid;

    public Date: Date;

    public Lines: string[];

    constructor(id: Guid) {
        super(id);
        this.Date = new Date();
        this.Lines = []
    }

    public async receiveChatLines(lines: string[], date: Date) {
        const newLines = lines.filter(line => !this.Lines.includes(line))
        this.Date = date;
        this.Lines = [...this.Lines, ...newLines]
        await this.apply(new ChatLinesReceivedEvent(this.Id, this.MapId, this.Date, this.Lines));
    }

    public async receiveChatLine(line: string, date : Date) {
        const exists = this.Lines.some(r => r === line)
        if (exists) {
            return;
        }
        this.Date = date;
        this.Lines = [...this.Lines, line]
        await this.apply(new ChatLinesReceivedEvent(this.Id, this.MapId, this.Date, this.Lines));
    }

}