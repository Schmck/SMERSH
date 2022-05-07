import { Guid } from "guid-typescript";
import { SearchReport } from '../../Framework'
import { Tickets, Team, Layout } from '../../../SMERSH/ValueObjects'

class MapSearchReport extends SearchReport {
    constructor(id: Guid) {
        super(id)
    }

    public Name: string;

    public TimeLimit: number;

    public Tickets: Record<number, Tickets>;

    public Layouts: Array<Layout>;

    public UpdateCalculatedProperties(): void { }
}