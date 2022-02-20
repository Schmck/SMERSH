import { Team } from '../../../../SMERSH/ValueObjects'

export class GameInfo {
    constructor(name: string, ranked: boolean, cheatProtection: string, type: string, map: string, mutators: string, realismMode: string, mpCampaignActive: boolean) {
        this.Name = name;
        this.Ranked = ranked;
        this.CheatProtection = cheatProtection;
        this.Type = type;
        this.Mutators = mutators;
        this.RealismMode = realismMode;
        this.MpCampaignActive = mpCampaignActive;
    }

    public Name: string;

    public Ranked: boolean;

    public CheatProtection: string;

    public Type: string;

    public Mutators: string;

    public RealismMode: string;

    public MpCampaignActive: boolean;
}