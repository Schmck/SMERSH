import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { ChatLinesReceivedEvent } from '../Events/Round'

export class Round extends Domain {

    public MapId: Guid;

    public Date: Date;

    public ChatLines: string[];



    public receiveChatLines(chatLines: string[]) {
        const exists = this.ChatLines.some(r => chatLines.includes(r))
        if (exists) {
            return;
        }
        this.apply(new ChatLinesReceivedEvent(this.Id, this.MapId, this.Date, chatLines));

    }

}