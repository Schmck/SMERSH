import { Team } from '../../../SMERSH/ValueObjects'

export class Player {
    constructor(team: number, name: string, ping: number, ip: string, uniqueId: string, admin: boolean, spectator: boolean, bot: boolean) {
        this.Team = Team.fromValue(team)
        this.Name = name;
        this.Ping = ping;
        this.Ip = ip;
        this.UniqueId = uniqueId;
        this.Admin = admin;
        this.Spectator = spectator;
    }

    public Team: Team | null;

    public Name: string;

    public Ping: number;

    public Ip: string;

    public UniqueId: string;

    public Admin: boolean;

    public Spectator: boolean;
}