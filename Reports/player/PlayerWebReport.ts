import { Report } from '../'
import { Guid } from "guid-typescript";

class PlayerWebReport extends Report {
    constructor(id: Guid) {
        super(id)
    }
}