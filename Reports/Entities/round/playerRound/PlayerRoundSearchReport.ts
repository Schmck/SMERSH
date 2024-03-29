

import { Guid } from "guid-typescript";
import { SearchReport } from '../../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'
import { IndexedClass } from "../../../../SMERSH/Utilities/types";

@Index()
export class PlayerRoundSearchReport extends SearchReport {
    constructor(id?: Guid) {
        super(id)
    }

    @Field('text')
    public PlayerId: string;

    @Field('text')
    public RoundId: string;

    @Field('date')
    public Date: Date;

    @Field('integer')
    public Team: number;


    @Field('integer')
    public Role: number;

    @Field('boolean')
    public Attacking: boolean;

    @Field('integer')
    public Score: number;

    @Field('integer')
    public Kills: number;

    @Field('integer')
    public Deaths: number;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    UpdateCalculatedProperties(): void { }
}