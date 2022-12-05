//import { Client } from '@elastic/elasticsearch';
const elastic = require('@elastic/elasticsearch')
const { Client } = elastic;
import { IndicesCreateRequest, IndexName, IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
import { IndicesCreateParams, ConfigOptions } from 'elasticsearch';
import * as reports from "../../Reports/Entities"
import { SearchReport } from "../../Reports/Framework"
import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";

export class ClientBuilder {
    private static INDEX_ALREADY_EXISTS: string = "index_already_exists_exception";
    private static RESOURCE_ALREADY_EXISTS: string = "resource_already_exists_exception";

    public log: FileLogger;
    public constructor(log: Logger = dummyLogger) {
        this.log = new FileLogger(`./info-${this.constructor.name}.log`)
    }

    public static async BuildClient<Client>(url: string) {
        const reports = this.getIndices();
        const client = new Client({
            node: url,
        } as ConfigOptions)

        for (let report of reports) {
            let exists = await client.indices.exists({ index: report })
            if (!exists) {
                this.BuildIndex(client, report)
            }
        }

        return client;
    }

    private static async BuildIndex(client: typeof Client, name: IndexName) {
        const options: IndicesCreateParams = {
            index: name.toLowerCase(),
        }
        const response: IndicesCreateResponse = await client.indices.create(options)
        if (!response.acknowledged) {
            console.log(`request to create index: ${name} failed, see: ${JSON.stringify(response, null, 4)}`)
        }
    }


    public static getIndices(): Array<any> {
        let indices = Object.keys(reports).map(report => {
            try {
                return reports[report]
                [
                    Object.keys(reports[report])
                    .find(key => reports[report][key].prototype instanceof SearchReport)
                ].name
            } catch (e) { return false }
        }).filter(r => r)

        return indices
    }
}