import { SearchReport } from '../../Framework'
import { Guid } from "guid-typescript";

export class RoundSearchReport extends SearchReport {
    constructor(id: Guid, mapId: Guid, date: Date) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
    }

    public MapId : Guid;

    public Date: Date;

    public UpdateCalculatedProperties(): void { }
}