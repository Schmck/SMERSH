import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { MapRegisteredEvent } from '../Events/Map'

export class Map extends Domain {

    public MapName: string;

    public TimeLimit: number;

    constructor(id: Guid) {
        super(id);
    }


    public registerMap(mapName: string, timeLimit: number) {
        this.MapName = mapName;
        this.TimeLimit = timeLimit;

        this.apply(new MapRegisteredEvent(this.Id, mapName, timeLimit));
        return;
    }
    
}