import { Team } from '../../../../SMERSH/ValueObjects';
export declare class Player {
    constructor(team: number, name: string, ping: number, ip: string, uniqueId: string, admin: boolean, spectator: boolean, bot: boolean);
    Team: Team | null;
    Name: string;
    Ping: number;
    Ip: string;
    UniqueId: string;
    Admin: boolean;
    Spectator: boolean;
}
