import { Guid } from "guid-typescript"
import { Command } from "../Command"

export class ChangeLayoutCommand extends Command {
    constructor(id: Guid, name: string, layout: Record<string, string[]>) {
        super(id)

        this.Name = name;
        this.Layout = layout;
    }

    public Name: string;

    public Layout: Record<string, string[]>
}