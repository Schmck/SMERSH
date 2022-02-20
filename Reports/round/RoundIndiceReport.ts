import { Report } from '../'
import { Guid } from "guid-typescript";

class RoundIndiceReport extends Report {
    constructor(id: Guid, mapId: Guid, date: Date) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
    }

    public MapId : Guid;

    public Date : Date;
}