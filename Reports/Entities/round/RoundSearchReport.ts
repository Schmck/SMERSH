import { SearchReport } from '../../Framework'
import { Guid } from "guid-typescript";
import { Index, Field } from '@../../../SMERSH/Utilities'


@Index()
export class RoundSearchReport extends SearchReport {
    constructor(id?: Guid, mapId?: Guid, date: Date = new Date()) {
        super(id)

        this.MapId = mapId ? mapId.toString() : "";
        this.Date = date;
        //this.Lines = [];
        //this.Players = [];
     
    }

    @Field('text')
    public MapId : string;

    @Field('date')
    public Date: Date;

    @Field({nested: Array<Record<any, any>>})
    public Lines: Array<Record<any, any>>;

    @Field('text')
    public Players: Array<string>;

    @Field('boolean')
    public IsActive: boolean;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    public UpdateCalculatedProperties(): void { }
}