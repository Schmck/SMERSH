import { Team, Role } from '../../../SMERSH/ValueObjects'

export class PlayerInfo {
    constructor(id: any, playerKey: string, team: number, playerName: string, role: number | string, score: number, kills: number, deaths: number, ipAddress: string, ping: number, admin: boolean, spectator: boolean, bot: boolean ) {

        this.Id = id;
        this.PlayerKey = playerKey;
        this.Team = Team.fromValue<Team>(team).DisplayName
        this.Playername = playerName;
        this.Role = typeof role === "number" ? Role.fromValue<Role>(role).DisplayName : Role.fromDisplayName<Role>(role).DisplayName;
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

    public Team: string;

    public Playername: string;

    public Role: string;

    public Score: number;

    public Kills: number;

    public Deaths: number;

    public IpAddress: string;

    public Ping: number;

    public Admin: boolean;

    public Spectator: boolean;

    public Bot: boolean;
}