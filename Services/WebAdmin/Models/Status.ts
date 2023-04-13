import { Team } from '../../../SMERSH/ValueObjects'
import { GameInfo } from './GameInfo';
import { PlayerInfo } from './PlayerInfo';
import { RulesInfo } from './RulesInfo';
import { TeamInfo } from './TeamInfo';

export class Status {
    constructor(players: Array<PlayerInfo>, teams: Array<TeamInfo>, game: GameInfo, rules: RulesInfo) {

        this.Players = players;
        this.Teams = teams;
        this.Game = game;
        this.Rules = rules;
    }

    public Players: Array<PlayerInfo>;

    public Teams: Array<TeamInfo>;

    public Game: GameInfo;

    public Rules: RulesInfo;

}