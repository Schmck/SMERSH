import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'

@Index()
export class PolicySearchReport extends SearchReport {
    constructor(id?: Guid) {
        super(id)
    }


    @Field('text')
    public PlayerId: string;

    @Field('text')
    public ChannelId: string;

    @Field('text')
    public Reason: string;

    @Field('text')
    public Action: string;

    @Field('boolean')
    public IsActive: boolean;

    @Field('date')
    public BanDate: Date;

    @Field('date')
    public UnbanDate?: Date;

    @Field('integer')
    public PlainId?: number;

    UpdateCalculatedProperties(): void { }
}