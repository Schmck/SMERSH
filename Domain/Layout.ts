import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { LayoutSavedEvent, LayoutRequirementsChangedEvent } from "../Events";

export class Layout extends Domain {

    public Name: string;

    public MinimumPlayerCount: number;

    public MaximumPlayerCount: number;

    public StartTime: number;

    public EndTime: number;


    public Layout: Record<string, string[]>;

    public IsActive: boolean;

    constructor(id: Guid) {
        super(id);
    }

    public saveLayout(name: string, layout: Record<string, string[]>) {
        this.apply(new LayoutSavedEvent(this.Id, name, layout, this.IsActive))
    }

    public changeLayoutRequirements(minimumPlayerCount: number, maximumPlayerCount: number, startTime: number, endTime: number) {

        if (this.MinimumPlayerCount == minimumPlayerCount && this.MaximumPlayerCount == maximumPlayerCount && this.StartTime === startTime && this.EndTime === endTime) {
            return;
        }

        this.apply(new LayoutRequirementsChangedEvent(this.Id, minimumPlayerCount, maximumPlayerCount, startTime, endTime))
    }

}