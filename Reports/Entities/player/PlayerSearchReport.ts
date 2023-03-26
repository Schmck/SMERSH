import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'

@Index()
export class PlayerSearchReport extends SearchReport {
    constructor(id?: Guid, name?: string) {
        super(id)
        this.Name = name || ""
    }

    @Field('text')
    public Name: string;


    @Field('text')
    public Ip: string;

    UpdateCalculatedProperties(): void { }
}