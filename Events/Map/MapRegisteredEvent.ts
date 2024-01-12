import { Guid } from "guid-typescript";
import { Event } from '../'

export class MapRegisteredEvent extends Event {

    constructor(id: Guid, name: string, timeLimit: number) {
        super(id)

        this.Name = name;
        this.TimeLimit = timeLimit;
    }

    public Name: string;

    public readonly TimeLimit: number;
}