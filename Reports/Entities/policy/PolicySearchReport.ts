import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'
import { RoleBan } from "../../../SMERSH/ValueObjects";


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
    public Name: string;

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

    @Field({ nested: Object })
    public RoleBans: Record<number, Array<RoleBan>>   

    UpdateCalculatedProperties(): void { }
}