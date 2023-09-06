import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Event } from '../../../Events'
import { Index, Field } from '../../../SMERSH/Utilities'
import { IndexedClass } from "../../../SMERSH/Utilities/types";

@Index()
export class EventSearchReport extends SearchReport {
    constructor(id?: Guid, event?: Event) {
        super(id)
        this.Event = event;
        this.Type = event ? event.constructor.name : ''
        this.Date = event ? event.Date : new Date();
    }

    @Field({nested: Event})
    public Event: Event;

    @Field('date')
    public Date: Date;

    @Field('text')
    public Type: string;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    public UpdateCalculatedProperties(): void { }
}