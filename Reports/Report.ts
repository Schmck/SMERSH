import { Guid } from "guid-typescript";

export class Report {
    constructor(id: Guid) {
        this.Id = id;
    }

    public Id : Guid 
}