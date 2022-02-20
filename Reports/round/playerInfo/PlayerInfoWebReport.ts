import { Report } from '../../'
import { Guid } from "guid-typescript";

class PlayerInfoWebReport extends Report {
    constructor(id: Guid) {
        super(id)
    }
}