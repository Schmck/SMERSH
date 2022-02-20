import { Guid } from "guid-typescript";
import { Report } from '../'
import { Tickets, Team, Layout } from '../../SMERSH/ValueObjects'

class MapIndiceReport extends Report{
    constructor(id: Guid) {
        super(id)
    }

    public Name: string;

    public TimeLimit: number;

    public Tickets: Record<number, Tickets>;

    public Layouts: Array<Layout>;
}