import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { PlayerRoundUpdatedEvent } from '../Events/Round/PlayerRound'

export class PlayerRound extends Domain {

    public PlayerId: string;

    public RoundId: Guid;

    public Team: number;

    public Role: number;

    public Attacking: boolean;

    public Score: number;

    public Kills: number;

    public Deaths: number;

    public constructor(id: Guid) {
        super(id)
    }

    public async update(playerId: string, roundId: Guid, team: number, role: number, attacking: boolean, score: number, kills: number, deaths: number) {
        if (this.RoundId && roundId !== this.RoundId) {
            return;
        }

        if (this.Team === team && this.Role === role && this.Score === score && this.Kills === kills && this.Deaths === deaths && this.Attacking === attacking) {
            return;
        }

        this.PlayerId = playerId;
        this.RoundId = roundId;
        this.Team = team;
        this.Role = role;
        this.Attacking = attacking;
        this.Score = score;
        this.Kills = kills;
        this.Deaths = deaths;

        await this.apply(new PlayerRoundUpdatedEvent(this.Id, playerId, roundId, team, role, attacking, score, kills, deaths))
        return;
    }
}