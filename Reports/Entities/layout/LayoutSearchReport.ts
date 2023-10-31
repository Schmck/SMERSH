import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout } from '../../../SMERSH/ValueObjects'
import { Index, Field } from '../../../SMERSH/Utilities'
import { IndexedClass } from "../../../SMERSH/Utilities/types";

@Index()
export class LayoutSearchReport extends SearchReport {
    constructor( id: Guid = Guid.create()) {
        super(id)
    }

    @Field('text')
    public Name: string;

    @Field('boolean')
    public IsActive: boolean;

    @Field('integer')
    public MinimumPlayerCount: number;

    @Field('integer')
    public MaximumPlayerCount: number;

    @Field('integer')
    public StartTime: number;

    @Field('integer')
    public EndTime: number;

    @Field('integer')
    public Ping: number;

    @Field({ nested: Object})
    public Maps: Record<string, string[]>;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    public UpdateCalculatedProperties(): void { }
}