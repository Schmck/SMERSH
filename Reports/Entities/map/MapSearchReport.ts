import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout } from '../../../SMERSH/ValueObjects'
import { Index, Field } from '../../../SMERSH/Utilities'

@Index()
export class MapSearchReport extends SearchReport {
    constructor(id: Guid, name : string, timeLimit: number, tickets: Record<number, Tickets>, layouts) {
        super(id)

        this.MapName = name || "";
        this.TimeLimit = timeLimit || 0;
        this.Tickets = tickets || { [Team.Axis.Value]: new Tickets(Team.Axis.Value, 0, 0), [Team.Allies.Value]: new Tickets(Team.Allies.Value, 0, 0) }
        this.Layouts = layouts || [ Layout.Regular ]
    }

    @Field('keyword')
    public MapName: string;

    @Field('integer')
    public TimeLimit: number;

    @Field({ nested: Tickets})
    public Tickets: Record<number, Tickets>;

    @Field({ nested: Layout })
    public Layouts: Array<Layout>;

    public UpdateCalculatedProperties(): void { }
}