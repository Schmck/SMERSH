import { Guid } from "guid-typescript";
import { IReport } from './IReport'

export abstract class Report implements IReport {
    constructor(id: Guid) {
        this.Id = id;
    }

    public Id: Guid
}