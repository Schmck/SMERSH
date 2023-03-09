import { Guid } from "guid-typescript";
import { Event } from '../'

export class RoundEndedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date, players : string[]) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
        this.Players = players;
    }

    public readonly MapId: Guid;

    public readonly Players: string[]
}