import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { ChatLinesReceivedEvent, RoundStartedEvent, RoundEndedEvent } from '../Events/Round'

export class Round extends Domain {

    public MapId: Guid;

    public Date: Date;

    public Lines: string[];

    public Players: Guid[];

    constructor(id: Guid) {
        super(id);
        this.Date = new Date();
        this.Lines = []
        this.Players = []
    }

    public async receiveChatLines(lines: string[], date: Date) {
        const newLines = lines.filter(line => !this.Lines.includes(line))
        this.Date = date;
        this.Lines = [...this.Lines, ...newLines]

        await this.apply(new ChatLinesReceivedEvent(this.Id, this.Date, this.Lines));
    }

    public async startRound(mapId: Guid, date: Date, players: Guid[]) {
        this.Date = date;
        this.MapId = mapId;
        this.Players = [...this.Players, ...players].filter((player, index, self) => self.findIndex(playa => player === playa) === index);

        await this.apply(new RoundStartedEvent(this.Id, this.MapId, this.Date, this.Players))
    }

    public async endRound(mapId: Guid, date: Date, players: Guid[]) {
        this.Date = date;
        this.Players = [...this.Players, ...players].filter((player, index, self) => self.findIndex(playa => player === playa) === index);

        await this.apply(new RoundEndedEvent(this.Id, this.MapId, this.Date, this.Players))
    }
}