import { Guid } from "guid-typescript";
import { Report } from '../'
import { Tickets, Team, Layout, Roles } from '../../../SMERSH/ValueObjects'

class PlayerIndiceReport extends Report {
    constructor(id: Guid) {
        super(id)
    }

    public Name: string;

  
}