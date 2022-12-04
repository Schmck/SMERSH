import { AggregateRoot } from '@nestjs/cqrs';
import { Guid } from "guid-typescript";

export class Domain extends AggregateRoot {
    public constructor(private id: Guid) {
        super();
        this.Id = id
    }

   public Id : Guid;
}