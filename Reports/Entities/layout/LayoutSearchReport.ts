import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout } from '../../../SMERSH/ValueObjects'
import { Index, Field } from '../../../SMERSH/Utilities'

@Index()
export class LayoutSearchReport extends SearchReport {
    constructor( id: Guid = Guid.create()) {
        super(id)
        this.Maps = []
    }

    public Maps: Array<Guid>;

    public UpdateCalculatedProperties(): void { }
}