import { Guid } from 'guid-typescript'
import { ClientBuilder } from './ClientBuilder' 
import { SearchReport } from '../Reports/Framework'
import { Indexed, IndexedClass } from '../SMERSH/Utilities/types'

const config = process.env;

export class SearchClient {
	
	public static async Get<T>( id: Guid, type: T): Promise<T> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		const newType = type as IndexedClass<T>;
		//const { documents } = await client.search(type, { body: { query: { match_all: {} } } })
		const { document } = await client.get(newType, id.toString())
		return document
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