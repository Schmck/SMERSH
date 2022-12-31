import { Guid } from "guid-typescript";
import { Report } from './Report'
import { Field } from '@../../../SMERSH/Utilities'


export abstract class SearchReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    @Field('text')
    public TypeName: string

    public abstract UpdateCalculatedProperties() : void
}