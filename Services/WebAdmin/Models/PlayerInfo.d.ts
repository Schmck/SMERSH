import { Team, Roles } from '../../../../SMERSH/ValueObjects';
export declare class PlayerInfo {
    constructor(team: number, name: string, role: number | string, score: number, kills: number, deaths: number, admin: boolean, spectator: boolean, bot: boolean);
    Team: Team | null;
    Name: string;
    Role: Roles | string;
    Score: number;
    Kills: number;
    Deaths: number;
    Ping: number;
    Admin: boolean;
    Spectator: boolean;
    Bot: boolean;
}
