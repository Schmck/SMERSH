import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout, Roles } from '../../../SMERSH/ValueObjects'

export class PlayerSearchReport extends SearchReport {
    constructor(id: Guid) {
        super(id)
    }

    public Name: string;

    UpdateCalculatedProperties(): void { }
}