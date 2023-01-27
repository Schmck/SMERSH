import { Guid } from "guid-typescript";

export class Event {

     constructor(id: Guid) {

         this.Id = id
     }

     public Id: Guid;
}