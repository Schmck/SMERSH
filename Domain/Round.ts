import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { ChatLineReceivedEvent } from '../Events/Round'

export class Round extends Domain {

    public MapId: Guid;

    public Date: Date;

    public Chat: string[];

    constructor(id: Guid) {
        super(id);
    }

    public receiveChatLine(line: string, date : Date) {
        const exists = this.Chat.some(r => r === line)
        if (exists) {
            return;
        }
        this.apply(new ChatLineReceivedEvent(this.Id, this.MapId, this.Date, line));

    }

}