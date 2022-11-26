import { Command } from './Command'
import { Guid } from "guid-typescript";
import { Team } from '../SMERSH/ValueObjects/round'

class ChatLineReceivedCommand implements  Command
{
    public constructor(id: Guid, line: string, date: Date, team: Team) {
        this.Id = id;
        this.Line = line
        this.Date = date;
        this.Team = team;
    }

    public Id: Guid;

    public Line: string

    public Date: Date

    public Team : Team
}