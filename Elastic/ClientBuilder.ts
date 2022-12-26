//import { Client } from '@elastic/elasticsearch';
const elastic = require('@elastic/elasticsearch')
const { Client } = elastic;
import { IndicesCreateRequest, IndexName, IndicesCreateResponse } from '@elastic/elasticsearch/lib/api/types';
import { IndicesCreateParams, ConfigOptions } from 'elasticsearch';
import * as reports from "../Reports/Entities"
import { SearchReport } from "../Reports/Framework"
import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../SMERSH/Utilities/FileLogger";

export class ClientBuilder {
    private static INDEX_ALREADY_EXISTS: string = "index_already_exists_exception";
    private static RESOURCE_ALREADY_EXISTS: string = "resource_already_exists_exception";
    public log: FileLogger;
    public constructor(log: Logger = dummyLogger) {
      //  this.log = new FileLogger(`./logs/info-${new Date().toISOString().split('.')[0]}-elastic-client-builder.log`);
        this.log = new FileLogger(`./logs/info.log`);
    };

    public static async BuildClient<Client>(url: string) {
        const reports = this.getIndices();
        const mappings = this.getMappings();
        const client = new Client({
            node: url,
        } as ConfigOptions)

        for (let report of reports) {
            let index = reports.indexOf(report)
            let exists = await client.indices.exists({ index: report })
            if (!exists) {
                this.BuildIndex(client, report, mappings[index])
            }
        }

        return client;
    }

    private static async BuildIndex(client: typeof Client, name: IndexName, mappings : any) {
        const options: IndicesCreateParams = {
            index: name.toLowerCase(),
            body: mappings 
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
        let searchReports = Object.keys(reports).map(report => {
            try {
                return reports[report]
                [
                    Object.keys(reports[report])
                    .find(key => reports[report][key].prototype instanceof SearchReport)
                ]
            } catch (e) { return false }
        }).filter(r => r)

        let mappings = searchReports.map(searchReport => {
            return { [searchReport.constructor.name]: this.autoPropertyWalker(searchReport) }
        });
        return indices
    }

    public static getMappings(): Array<any> {
        let mappings = Object.keys(reports).map(report => {
            let obj = reports[report][
                Object.keys(reports[report])
                .find(key => reports[report][key].prototype instanceof SearchReport)
            ];
            return ClientBuilder.autoPropertyWalker(new obj)
            /*return Object.keys(new obj).map(field => {
                if (typeof (new obj)[field] === 'object') {
                    return { [field]: ClientBuilder.autoPropertyWalker((new obj)[field]) }
                }

                return { [field]: typeof (new obj)[field] }
            })*/
        }).filter(r => r)

        mappings = mappings.map(report => {
            let copy = {}
            for (let key in report) {
                console.log(report[key])
                copy = { ...copy, ...report[key] }

                if (Array.isArray(copy[key])) {
                    copy[key] = copy[key][0]
                }
            }
            return copy
        })

        mappings = mappings.map(report => {
            let copy = report
            for (let key in report) {
                console.log(report[key])
                if (Array.isArray(copy[key])) {
                    copy[key] = copy[key][0]
                }

                if (typeof copy[key] === "object" && copy[key][0]) {
                    copy[key] = copy[key][0]
                }
            }
            return copy
        })

        console.log(mappings)
        //this.log.info(JSON.stringify(mappings))
        return mappings
    }


    public static autoPropertyWalker(obj: any) {
        let mappings = Object.keys(obj).map(key => {
            let instance = obj[key]

            if (typeof instance == "object") {
                return { [key]: this.autoPropertyWalker(instance) }
            }

            return { [key]: typeof obj[key] }

        })
        
        return mappings
    }


}