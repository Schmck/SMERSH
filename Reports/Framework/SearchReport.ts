import { Guid } from "guid-typescript";
import { Report } from './Report'
import { Field } from '@../../../SMERSH/Utilities'
import { IndexedClass } from "../../SMERSH/Utilities/types";


export abstract class SearchReport extends Report {
    constructor(id?: Guid) {
        super(id)
    }

    @Field('text')
    public TypeName: string

    public abstract GetType(): IndexedClass<this>

    public abstract UpdateCalculatedProperties() : void
}