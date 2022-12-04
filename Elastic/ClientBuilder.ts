//import { Client } from '@elastic/elasticsearch';
//import { IndicesCreateRequest, IndexName, IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
//import { IndicesCreateParams, ConfigOptions } from 'elasticsearch';
import * as reports from "../Reports/Entities"
import { SearchReport } from "../Reports/Framework"

export class ClientBuilder {
    private static INDEX_ALREADY_EXISTS : string = "index_already_exists_exception";
    private static RESOURCE_ALREADY_EXISTS: string = "resource_already_exists_exception";

    public static BuildClient(url: string) {
    //public static BuildClient<Client>(url: string) {
        /*const reports = this.getIndices();
        const client = new Client({
            node: url,
        } as ConfigOptions)

        for (let report in reports) {
            let exists = client.indices.exists({ index: report }) || true
            if (!exists) {
                this.BuildIndex(client, report)
            }
        }

        return client;*/
    }

    /*private static async BuildIndex(client: Client, name: IndexName) {
        const options : IndicesCreateParams = {
            index: name,
            includeTypeName: true,
        }
        const response : IndicesCreateResponse = await client.indices.create(options)
        if (!response.acknowledged) {
            console.log(`request to create index: ${name} failed, see: ${JSON.stringify(response, null, 4)}`)
        }
    }*/


    public static getIndices(): Array<any> {
        let reporting = Object.keys(reports);
        console.log(reporting, reports);
        let indices = Object.keys(reports).map(report => {
            try {
                return reports[report]
                [
                    Object.keys(reports[report])
                    .find(key => reports[report][key].prototype instanceof SearchReport)
                ].name
            } catch (e) {return false}
        }).filter(r => r)

        return indices
    }
}

