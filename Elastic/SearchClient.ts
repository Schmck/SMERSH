import { Guid } from 'guid-typescript'
import { ClientBuilder } from './ClientBuilder' 
import { SearchReport } from '../Reports/Framework'
import { IndexedClass } from '../SMERSH/Utilities/types'
import { RoundSearchReport } from '../Reports/Entities/round'

const config = process.env;

export class SearchClient {
	
	public static async Get<T>(id: Guid, cls: { new(): T }): Promise<T> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		//const newCls = type as IndexedClass<T>;
		//const { documents } = await client.search(type, { body: { query: { match_all: {} } } })
		//const { document } = await client.get(cls, id.toString())
		let doc

		try {
			const { document } = await client.get(cls, id.toString())
			doc = document
		}
		catch (error) {
			return null;
        }
		return doc as T
	}

	public static async GetMany<T>(type: IndexedClass<T>) : Promise<Array<T>> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		const { documents } = await client.search(type, { body: { query: { match_all: {} } } })
		return documents
	}

	public static async Search<T>(type: IndexedClass<T>, query: any) : Promise<Array<T>> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		const { documents } = await client.search(type, { body: { query: { match_all: {} } } })
		return documents
	}

	public static async Put<T>(document: T) : Promise<T> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		await client.index(document)
		return document;
	}

	public static async Update<T>(document: T) {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		await client.update(document)
    }
}