import { Team } from '../../../../SMERSH/ValueObjects';
export declare class ChatMessage {
    constructor(team: number, teamMessage: boolean, name: string, message: string);
    Team: Team | null;
    TeamMessage: boolean;
    Name: string;
    Message: string;
}
