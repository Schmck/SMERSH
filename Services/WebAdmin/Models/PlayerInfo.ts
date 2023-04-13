import { Team, Role } from '../../../SMERSH/ValueObjects'

export class PlayerInfo {
    constructor(id: any, playerKey: string, team: number, playerName: string, role: number | string, score: number, kills: number, deaths: number, ipAddress: string, ping: number, admin: boolean, spectator: boolean, bot: boolean ) {

        this.Id = id;
        this.PlayerKey = playerKey;
        this.Team = Team.fromValue(team)
        this.Playername = playerName;
        this.Role = typeof role === "number" ? Role.fromValue(role) : Role.fromDisplayName(role);
        this.Score = score;
        this.Kills = kills;
        this.Deaths = deaths;
        this.IpAddress = ipAddress;
        this.Ping = ping;
        this.Admin = admin;
        this.Spectator = spectator;
        this.Bot = bot;
    }

    public Id: any;

    public PlayerKey: string;

    public Team: Team;

    public Playername: string;

    public Role: Role;

    public Score: number;

    public Kills: number;

    public Deaths: number;

    public IpAddress: string;

    public Ping: number;

    public Admin: boolean;

    public Spectator: boolean;

    public Bot: boolean;
}