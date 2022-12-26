﻿import { Guid } from "guid-typescript";
import { IReport } from './IReport'

export abstract class Report implements IReport {
    constructor(id: Guid) {
        if (id) {
            this.Id = id.toString();
        } else {
            this.Id = Guid.create().toString();
        }
    }

    public Id: string
}