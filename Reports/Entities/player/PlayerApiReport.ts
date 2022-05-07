import { Report } from '../../Framework'
import { Guid } from "guid-typescript";

export class PlayerApiReport extends Report {
    constructor(id: Guid, name: string) {
        super(id)
        this.Name = name;
    }

    public Name: string;
}
