import { SearchClient } from '../../Elastic/SearchClient'
import { Injectable } from '@nestjs/common';
import { Guid } from 'guid-typescript'
import { IndexedClass } from '../../SMERSH/Utilities/types'
import { SearchReport } from '../../Reports/Framework'

@Injectable()
export class Repository {

    public async Get<T, K>(id: Guid, type: { new(): T }, dom: { new(id: Guid): K }): Promise<K> {
        const newCls = new type() as IndexedClass<T>;
        const domain: K = new dom(id) as K;

        let report: T = await SearchClient.Get<T>(id, type) as T

        if (!report) {
            newCls['Id'] = id.toString()
            report = await SearchClient.Put(newCls) as T
        }

        Object.keys(report).forEach(key => {
            domain[key] = report[key]
        })

        return domain
    }

}