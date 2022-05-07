import { Guid } from "guid-typescript";
import { SearchReport } from '../../../Framework'
import { Tickets, Team, Layout, Roles } from '../../../../SMERSH/ValueObjects'

export class PlayerInfoSearchReport extends SearchReport {
    constructor(id: Guid) {
        super(id)
    }

    public playerId: string;

    public Team: Team;

    public Role: Roles;

    public Score: number;

    public Kills: number;

    UpdateCalculatedProperties(): void { }
}