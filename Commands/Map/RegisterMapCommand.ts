import { Guid } from "guid-typescript";
import { Command } from '../Command'

export class RegisterMapCommand extends Command {

    constructor(id: Guid, name: string, timeLimit: number) {
        super(id)
        this.Name = name;
        this.TimeLimit = timeLimit;
    }

    public readonly Name: string;

    public readonly TimeLimit: number;

}