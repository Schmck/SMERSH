import { Team } from '../../../SMERSH/ValueObjects'

export class Player {
    constructor(team: number, playername: string, playerKey: string, ping: number, ip: string, id: string, admin: boolean, spectator: boolean, bot: boolean) {
        this.Team = Team.fromValue<Team>(team)
        this.Playername = playername;
        this.PlayerKey = playerKey;
        this.Ping = ping;
        this.Ip = ip;
        this.Id = id;
        this.Admin = admin;
        this.Spectator = spectator;
    }

    public Team: Team | null;

    public Playername: string;

    public PlayerKey: string;

    public Ping: number;

    public Ip: string;

    public Id: string;

    public Admin: boolean;

    public Spectator: boolean;
}