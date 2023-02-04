import { SearchReport } from '../../Framework'
import { Guid } from "guid-typescript";
import { Index, Field } from '@../../../SMERSH/Utilities'


@Index()
export class RoundSearchReport extends SearchReport {
    constructor(id: Guid = Guid.create(), mapId: Guid = Guid.create(), date: Date = new Date()) {
        super(id)

        this.MapId = mapId;
        this.Date = date;
        this.Lines = []
     
    }

    @Field('text')
    public MapId : Guid;

    @Field('date')
    public Date: Date;

    @Field({ nested : Array<string>})
    public Lines : string[];


    public UpdateCalculatedProperties(): void { }
}