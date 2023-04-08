

import { Guid } from "guid-typescript";
import { SearchReport } from '../../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'

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

    @Field('integer')
    public Score: number;

    @Field('integer')
    public Kills: number;

    @Field('integer')
    public Deaths: number;

    UpdateCalculatedProperties(): void { }
}