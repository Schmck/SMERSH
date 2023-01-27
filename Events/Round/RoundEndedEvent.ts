import { Guid } from "guid-typescript";
import { Event } from '../'

export class RoundEndedEvent extends Event {

    constructor(id: Guid, mapId: Guid, date: Date) {
        super(id)
        this.MapId = mapId;
        this.Date = date;
    }

    public readonly MapId: Guid

    public readonly Date: Date;

}