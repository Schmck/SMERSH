import { Guid } from "guid-typescript";
import { Event } from '../'

export class RoundStartedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date, players : Guid[]) {
        super(id)
        this.MapId = mapId;
        this.Date = date;
        this.Players = players;
    }

    public readonly MapId: Guid

    public readonly Date: Date;

    public readonly Players: Guid[];

}