import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { MapChangedEvent } from '../Events/Map'

export class Map extends Domain {

    public MapName: string;

    public TimeLimit: number;

    constructor(id: Guid) {
        super(id);
    }


    public changeMap(mapName: string, timeLimit: number) {
        this.MapName = mapName;
        this.TimeLimit = timeLimit;
        return;
    }
    
}