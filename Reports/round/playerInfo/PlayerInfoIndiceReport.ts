import { Guid } from "guid-typescript";
import { Report } from '../../'
import { Tickets, Team, Layout, Roles } from '../../../../SMERSH/ValueObjects'

class PlayerInfoIndiceReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    public playerId: string;

    public Team: Team;

    public Role: Roles;

    public Score: number;

    public Kills: number;
}