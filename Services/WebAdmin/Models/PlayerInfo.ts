import { Team, Roles } from '../../../SMERSH/ValueObjects'

export class PlayerInfo {
    constructor(team: number, name: string, role: number | string, score: number, kills: number, deaths: number, admin: boolean, spectator: boolean, bot: boolean ) {
        this.Team = Team.fromValue(team)
        this.Name = name;
        this.Role = typeof role === "number" ? Roles.fromValue(role) : Roles.fromDisplayName(role);
        this.Score = score;
        this.Kills = kills;
        this.Deaths = deaths;
        this.Admin = admin;
        this.Spectator = spectator;
        this.Bot = bot;
    }

    public Team: Team | null;

    public Name: string;

    public Role: Roles | string;

    public Score: number;

    public Kills: number;

    public Deaths: number;

    public Ping: number;

    public Admin: boolean;

    public Spectator: boolean;

    public Bot: boolean;
}