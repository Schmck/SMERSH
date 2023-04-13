import { Guid } from "guid-typescript";
import { Event } from '../'

export class LayoutChangedEvent extends Event {

    constructor(id: Guid, name: string, layout: Record<string, string[]>, isActive: boolean) {
        super(id)

        this.Name = name;
        this.Layout = layout;
        this.IsActive = isActive;
    }

    public readonly Name: string;

    public readonly Layout: Record<string, string[]>;

    public readonly IsActive: boolean;
}