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

    @Field({nested: Array<Record<string, string>>})
    public Lines: Array<Record<string, string>>;

    @Field('text')
    public Players: Array<string>;

    @Field('boolean')
    public IsActive: boolean;

    public UpdateCalculatedProperties(): void { }
}