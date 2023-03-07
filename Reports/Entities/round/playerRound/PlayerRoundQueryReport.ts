import { Guid } from "guid-typescript";
import { SearchReport, Report } from '../../../Framework'
import { Tickets, Team, Layout, Role } from '../../../../SMERSH/ValueObjects'

export class PlayerRoundQueryReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    public RoundId: Guid;

    public Team: Team;

    public Role: Role;

    public Score: number;

    public Kills: number;
}