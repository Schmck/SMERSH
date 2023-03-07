import { Report } from '../../../Framework'
import { Guid } from "guid-typescript";

export class PlayerRoundApiReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    public RoundId: Guid;

    public Team: number;//ENUM

    public Role: number;//ENUM

    public Score: number;

    public Kills: number;
}