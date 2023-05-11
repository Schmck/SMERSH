import { Guid } from "guid-typescript";
import { Event } from '../'

export class LayoutRequirementsChangedEvent extends Event {
    constructor(id: Guid, minimumPlayerCount: number, maximumPlayerCount: number, startTime: number, endTime: number) {
        super(id)

        this.MinimumPlayerCount = minimumPlayerCount;
        this.MaximumPlayerCount = maximumPlayerCount;
        this.StartTime = startTime;
        this.EndTime = endTime;
    }

    public MinimumPlayerCount: number;

    public MaximumPlayerCount: number;

    public StartTime: number;

    public EndTime: number;

}