import { Guid } from "guid-typescript";
import { Domain } from './Domain'
import { MapChangedEvent } from '../Events/Map'
import { LayoutChangedEvent } from "../Events";

export class Layout extends Domain {

    public Name: string;

    public Layout: Record<string, string[]>;

    public IsActive: boolean;

    constructor(id: Guid) {
        super(id);
    }

    public changeLayout(name: string, layout: Record<string, string[]>) {
        this.apply(new LayoutChangedEvent(this.Id, name, layout, this.IsActive))
    }

}