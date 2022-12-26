import { Guid } from "guid-typescript";
import { ICommand as Command } from '../SMERSH/Interfaces/commands/'

export declare interface ICommand extends Command  {

    Id: Guid
}