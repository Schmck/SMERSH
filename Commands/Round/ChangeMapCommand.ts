import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class ChangeMapCommand extends Command {

    constructor(id: Guid, mapId: Guid, mapName: string) {
        super(id)
        this.MapId = mapId;
        this.MapName = mapName;
    }

    public readonly MapId: Guid;

    public readonly MapName: string;

}