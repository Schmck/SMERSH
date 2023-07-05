import { Guid } from "guid-typescript";
import { Command } from "../Command";

export class ChangeVisibilityCommand extends Command {
    public constructor(id: Guid, invisible: boolean) {
        super(id)

        this.Invisible = invisible;
    }

    public Id: Guid;

    public Invisible: boolean;
}