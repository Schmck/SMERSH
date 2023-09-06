import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout } from '../../../SMERSH/ValueObjects'
import { Index, Field } from '../../../SMERSH/Utilities'
import { IndexedClass } from "../../../SMERSH/Utilities/types";

@Index()
export class MapSearchReport extends SearchReport {
    constructor(
        id: Guid = Guid.create(),
        name: string = "",
        timeLimit: number = 0,
        tickets: Record<number, Tickets> = { [Team.Axis.Value]: new Tickets(Team.Axis.Value, 0, 0), [Team.Allies.Value]: new Tickets(Team.Allies.Value, 0, 0) },
        layouts : Array<Layout> = [ Layout.Regular ]
    ) {
        super(id)

        this.MapName = name;
        this.TimeLimit = timeLimit;
        this.Tickets = tickets
        this.Layouts = layouts
    }

    @Field('keyword')
    public MapName: string;

    @Field('integer')
    public TimeLimit: number;

    @Field({ nested: Tickets})
    public Tickets: Record<number, Tickets>;

    @Field({ nested: Layout })
    public Layouts: Array<Layout>;

    public GetType(): IndexedClass<this> {
        return this as unknown as IndexedClass<this>;
    }

    public UpdateCalculatedProperties(): void { }
}