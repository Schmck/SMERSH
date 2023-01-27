//import { Client } from '@elastic/elasticsearch';
const elastic = require('@elastic/elasticsearch')
const { Client } = elastic;
import { IndicesCreateRequest, IndexName, IndicesCreateResponse, NodesClient } from '@elastic/elasticsearch/lib/api/types';
import { IndicesCreateParams, ConfigOptions } from 'elasticsearch';
import * as reports from "../../Reports/Entities"
import { SearchReport } from "../../Reports/Framework"
import { Logger, dummyLogger } from "ts-log/build/src/index";
import { FileLogger } from "../../SMERSH/Utilities/FileLogger";
import { Index, Field, Elasticsearch, Primary } from '../../SMERSH/Utilities';
import { Guid } from "guid-typescript";


export class ClientBuilder {
    private static INDEX_ALREADY_EXISTS: string = "index_already_exists_exception";
    private static RESOURCE_ALREADY_EXISTS: string = "resource_already_exists_exception";

    public log: FileLogger;
    public constructor(log: Logger = dummyLogger) {
        this.log = new FileLogger(`./info-${this.constructor.name}.log`)
    }

    public static logger = new FileLogger(`./info-${this.constructor.name}.log`)

    public static async Build<ElasticSearch>(url: string) {
        //const indices = this.getIndices();
        const reports = this.getReports();
        const client = new Elasticsearch({
            host: url,
        })
  
        for (let report of reports) {
    
            let exists = await client.indices.exists(report)
            if (!exists) {
                let create = await client.indices.create(report);
                let mappings = await client.indices.putMapping(report);

                let instantiated = new report();
                let put = await client.index(instantiated)

                let refresh = await client.indices.refresh(report);

                const { documents } = await client.search(report, { body: { query: { match_all: {} } } });
                console.log(documents)
            }
        }

        return client;
    }


    

    public static async GetClient<NodesClient>(url: string) {
        const client : NodesClient = new Client({
            node: url,
        } as ConfigOptions)

        return client;
    }

    public static getReports(): Array<any> {
        let reportz = Object.keys(reports).map(report => {
            let obj = reports[report][
                Object.keys(reports[report])
                    .find(key => reports[report][key].prototype instanceof SearchReport)
            ];

            return obj

        })

        return reportz;
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

    public static getMappings(): Array<any> {
        let mappings = Object.keys(reports).map(report => {
            let searchReport = Object.keys(reports[report]).find(key => reports[report][key].prototype instanceof SearchReport)
            let obj = reports[report][searchReport];

            return ClientBuilder.autoPropertyWalker(new obj)
        }).filter(r => r).map(report => {
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
            let copy = report;
            for (let key in report) {
                console.log(report[key])
                if (Array.isArray(report[key])) {
                    copy[key] = report[key][0]
                }

                if (copy[key]["fields"] && Array.isArray(copy["fields"])) {
                    copy[key]["fields"] = report[key]["fields"][0]
                }

                if (typeof copy[key] === "object" && copy[key][0]) {
                    copy[key] = report[key][0]
                }
            }
            return copy
        })

        mappings.map(report => {
            let copy = report;
            for (let key in report) {
                if (copy[key]["fields"] && Array.isArray(copy[key]["fields"])) {
                    copy[key]["fields"] = copy[key]["fields"].reduce((prev, current) => {
                        const key = Object.keys(current)[0]

                        if (Array.isArray(current[key])) {
                            return {
                                ...prev,
                                [key]: current[key].reduce((old, newer) => {
                                    const keys = Object.keys(newer)[0] 
                                    return { ...old, [keys]: newer[keys]}
                                })
                            }
                        }

                        //console.log(key, current[key])
                        return { ...prev, [key]: current[key] }
                    }, {})
                }
            }
            return copy
        })

        mappings = mappings.map(report => {
            let copy = report
            for (let key in report) {
                console.log(report[key])
               

                if (copy[key]["fields"] && copy[key]["fields"]["0"]) {
                    copy[key]["fields"] = copy[key]["fields"]["0"]
                }

            }
            return copy
        })

        console.log(mappings)
        this.logger.info(JSON.stringify(mappings))
        return mappings
    }


    public static autoPropertyWalker(obj: any, level : number = 0) {
        let mappings = Object.keys(obj).map(key => {
            let instance = obj[key]

            if (typeof instance == "object") {
                if (level === 0) {
                    return {
                        [key]: {
                            type: this.getElasticType(typeof obj[key]),
                            fields: this.autoPropertyWalker(instance, level + 1)
                        }
                    }
                } else return {
                    [key]: this.autoPropertyWalker(instance, level + 1)
                }

                
            }

            return {
                [key]:
                {
                    type: this.getElasticType(typeof instance)
                }
                }
            /*return {
                [key]: {
                    type: typeof obj[key]
                }
            }*/

        })

        return mappings
    }

    public static getElasticType(type: string) {
        switch (type) {
            case "string":
                return "text";
                break
            case "number":
                return "integer";
            default :
                return type 
        }
    }
}