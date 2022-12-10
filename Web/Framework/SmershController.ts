import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";

export class SmershController {
    public log: FileLogger;
    public constructor(log: Logger = dummyLogger) {
        this.log = new FileLogger(`./info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
    }

}