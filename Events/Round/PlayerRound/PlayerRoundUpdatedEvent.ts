import { Guid } from "guid-typescript";
import { Event } from '../../'

export class PlayerRoundUpdatedEvent extends Event {


    constructor(id: Guid, playerId: string, roundId: Guid, team: number, role: number, attacking: boolean, score: number, kills: number, deaths: number) {
        super(id)

        this.PlayerId = playerId;
        this.RoundId = roundId;
        this.Team = team;
        this.Role = role;
        this.Attacking = attacking;
        this.Score = score;
        this.Kills = kills;
        this.Deaths = deaths;
    }

    public PlayerId: string;

    public RoundId: Guid;

    public Team: number;

    public Role: number;

    public Attacking: boolean;

    public Score: number;

    public Kills: number;

    public Deaths: number;
}