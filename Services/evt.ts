import * as fs from 'fs';
import * as path from 'path'
import * as dotenv from 'dotenv';

export class evt {
    constructor(env: Record<any, any>) {
        this.environment = env || {}
    }

    public environment: Record<any, any>

    public static Environment: evt

    public static set(env: Record<any, any>): Record<any, any> {
        this.Environment = new evt(env)

        return this.Environment.environment;
    }

    public static update(key: any, value: any) : void {
        let copy = { ...this.Environment.environment };
        copy[key] = value
        return;
    }

    public static env(): Record<any, any> {
        return this.Environment.environment;
    }

    public static parseEnvFile(filePath: string): Record<string, any> {
        // Read the file contents
        const fileContents = fs.readFileSync(filePath, 'utf-8');

        // Use dotenv to parse the file contents
        const parsed = dotenv.parse(fileContents);

        // Convert the parsed result into a Record<string, any>
        const envRecord: Record<string, any> = {};
        for (const key in parsed) {
            if (parsed.hasOwnProperty(key)) {
                envRecord[key] = parsed[key];
            }
        }

        return envRecord;
    }
}