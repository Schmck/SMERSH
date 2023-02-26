import { Guid } from "guid-typescript";
import { Event } from '../'

export class RoundStartedEvent extends Event {

    constructor(id: Guid, mapId: Guid, timeLimit: number, date: Date, players: string[]) {
        super(id)

        this.MapId = mapId;
        this.TimeLimit = timeLimit;
        this.Date = date;
        this.Players = players;
    }

    public readonly MapId: Guid;

    public readonly TimeLimit; 

    public readonly Date: Date;

    public readonly Players: string[];

}