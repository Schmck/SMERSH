import { Team } from '../../../SMERSH/ValueObjects'

export class ChatMessage {
    constructor(team: number, teamMessage: boolean, name: string, message: string) {
        this.Team = Team.fromValue(team);
        this.TeamMessage = teamMessage;
        this.Name = name;
        this.Message = message;
    }

    public Team: Team | null;

    public TeamMessage: boolean;

    public Name: string;

    public Message: string;
}