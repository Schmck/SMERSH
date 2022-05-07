import { Guid } from "guid-typescript";
import { SearchReport, Report } from '../../../Framework'
import { Tickets, Team, Layout, Roles } from '../../../../SMERSH/ValueObjects'

export class PlayerInfoQueryReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    public Team: Team;

    public Role: Roles;

    public Score: number;

    public Kills: number;
}