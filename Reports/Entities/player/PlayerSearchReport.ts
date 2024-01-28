import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Index, Field } from '@../../../SMERSH/Utilities'
import { IndexedClass } from "../../../SMERSH/Utilities/types";
import { Role } from "../../../SMERSH/ValueObjects";
import { DiscordRole } from "../../../SMERSH/ValueObjects/player";

@Index()
export class PlayerSearchReport extends SearchReport {
    constructor(id?: Guid) {
        super(id)

        this.Invisible = true;
        this.Role = DiscordRole.Regular.Value;
    }

    @Field('text')
    public Name: string;

    @Field('text')
    public Ip: string;

    @Field('integer')
    public Role: number;

    @Field('boolean')
    public Invisible: boolean;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    UpdateCalculatedProperties(): void { }
}