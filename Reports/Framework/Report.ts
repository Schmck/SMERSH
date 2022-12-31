import { Guid } from "guid-typescript";
import { IReport } from './IReport'
import { Field, Primary } from '@../../../SMERSH/Utilities'

class guid {
    public constructor() { }
    private value;
}

export abstract class Report implements IReport {
    constructor(id: Guid) {
        if (id) {
            this.Id = id;
        } else {
            this.Id = Guid.create();
        }
    }

    @Primary()
    @Field({ object: guid })
    public Id: Guid
}