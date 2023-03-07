import { Guid } from "guid-typescript";
import { Command } from '../../Command'

export class UpdatePlayerRoundCommand extends Command {

    constructor(id: Guid, playerId: string, roundId: Guid, team: number, role: number, score: number, kills: number, deaths: number) {
        super(id)

        this.PlayerId = playerId;
        this.RoundId = roundId;
        this.Team = team;
        this.Role = role;
        this.Score = score;
        this.Kills = kills;
        this.Deaths = deaths;
    
    }


    public PlayerId: string;

    public RoundId: Guid;

    public Team: number;

    public Role: number;

    public Score: number;

    public Kills: number;

    public Deaths: number;

}