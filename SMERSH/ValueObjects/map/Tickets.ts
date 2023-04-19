import { Team } from '../'

export class Tickets {
    constructor(team: number, attacking: number, defending: number) {
        this.Team = Team.fromValue<Team>(team);
        this.Attacking = attacking;
        this.Defending = defending;
    }

    public Team: Team;

    public Attacking: number;

    public Defending: number;

}