import { Guid } from "guid-typescript";
import { Event } from '../'

export class MapChangedEvent extends Event {

    constructor(id: Guid, mapId: Guid, mapName : string) {
        super(id)

        this.MapId = mapId;
        this.MapName = mapName;
    }

    public MapId: Guid;

    public readonly MapName: string;
}