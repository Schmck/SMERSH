import { Team } from '../../../../SMERSH/ValueObjects'

export class TeamInfo {
    constructor(name: string, size: number, attacking: boolean, roundsWon: number, score: number, territories: number) {
        this.Name = name;
        this.Size = size;
        this.Attacking = attacking;
        this.RoundsWon = roundsWon;
        this.Score = score;
        this.Territories = territories;
    }

    public Name: string;

    public Size: number;

    public Attacking: boolean;

    public RoundsWon: number;

    public Score: number;

    public Territories: number;
}