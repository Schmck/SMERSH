import { FileLogger } from "../../../SMERSH/Utilities/FileLogger";

export class Query {

    public static log: FileLogger = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-Query.log`);
}