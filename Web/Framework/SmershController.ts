import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";

export class SmershController {
    public log: FileLogger;
    public constructor(log: Logger = dummyLogger) {
        this.log = new FileLogger(`info-${this.constructor.name}.log`)
    }

}