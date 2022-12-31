import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout, Roles } from '../../../SMERSH/ValueObjects'
import { Index, Field } from '@../../../SMERSH/Utilities'

@Index()
export class PlayerSearchReport extends SearchReport {
    constructor(id: Guid, name : string) {
        super(id)
        this.Name = name || ""
    }

    @Field('text')
    public Name: string;

    UpdateCalculatedProperties(): void { }
}