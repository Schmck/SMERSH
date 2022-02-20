import { Team } from '../../../../SMERSH/ValueObjects'

export class RulesInfo {
    constructor(timeLimit: number, timeLeft: number, roundLimit: string, playersCurrent: number, playersMax: number, spectatorsCurrent: number, spectatorsMax: number) {
        this.TimeLimit = timeLimit;
        this.TimeLeft = timeLeft;
        this.RoundLimit = roundLimit;
        this.PlayersCurrent = playersCurrent;
        this.PlayersMax = playersMax;
        this.SpectatorsCurrent = spectatorsCurrent;
        this.SpectatorsMax = spectatorsMax;
    }

    public TimeLimit: number;

    public TimeLeft: number;

    public RoundLimit: string;

    public PlayersCurrent: number;

    public PlayersMax: number;

    public SpectatorsCurrent: number;

    public SpectatorsMax: number;
}