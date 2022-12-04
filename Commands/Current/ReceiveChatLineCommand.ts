import { Command } from '../Command'
import { Guid } from "guid-typescript";
import { Team } from '../../SMERSH/ValueObjects/round'

class ReceiveChatLineCommand implements Command {
    public constructor(id: Guid, line: string, date: Date, team: Team) {
        this.Id = id;
        this.Line = line
        this.Date = date;
        this.Team = team;
    }

    public readonly Id: Guid;

    public readonly Line: string

    public readonly Date: Date

    public readonly Team: Team
}