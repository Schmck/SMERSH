import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { ChatLinesReceivedEvent, RoundStartedEvent, RoundEndedEvent } from '../Events/Round'
import { MapChangedEvent } from '../Events/Map'

export class Round extends Domain {

    public MapId: Guid;

    public Date: Date;

    public Lines: Array<Record<string, string>>;

    public Players: string[];

    constructor(id: Guid) {
        super(id);
        this.Date = new Date();
        this.Lines = []
        this.Players = []
    }

    public async receiveChatLines(lines: Array<Record<string, string>>, date: Date) {
        const newLines = lines.filter(line => !this.Lines.some(line2 => line2.message === line.message))
        this.Date = date;
        this.Lines = [...this.Lines, ...newLines]

        await this.apply(new ChatLinesReceivedEvent(this.Id, this.Date, this.Lines));
    }

    public async startRound(timeLimit: number, date: Date, players: string[]) {
        this.Date = date;
        this.Players = [...this.Players, ...players].filter((player, index, self) => self.findIndex(playa => player === playa) === index);

        await this.apply(new RoundStartedEvent(this.Id, this.MapId, timeLimit, this.Date, this.Players))
    }

    public async endRound(date: Date, players: string[]) {
        this.Date = date;
        this.Players = [...this.Players, ...players].filter((player, index, self) => self.findIndex(playa => player === playa) === index);

        await this.apply(new RoundEndedEvent(this.Id, this.MapId, this.Date, this.Players))
    }

    public async changeMap(mapId: Guid, mapName: string) {

        this.MapId = mapId;
         await this.apply(new MapChangedEvent(this.Id, this.MapId, mapName))
    }
}