import { Guid } from 'guid-typescript'
import { ClientBuilder } from './ClientBuilder' 
import { SearchReport } from '../Reports/Framework'
import { IndexedClass } from '../SMERSH/Utilities/types'
import { RoundSearchReport } from '../Reports/Entities/round'

const config = process.env;

export class SearchClient {

	public static queue: Array<Promise<any>> = []

	public static async Exists<T>(id: Guid, cls: { new(): T }) {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		try {
			await client.get(cls, id.toString())
			return true
		}
		catch (error) {
			return false;
		}
    }

	public static async Get<T>(id: Guid, cls: { new(): T }): Promise<T> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		let doc : T

		try {
			const { document } = await client.get(cls, id.toString())
			doc = document
		}
		catch (error) {
			//return new cls() as T;
			return null;
        }
		return doc
	}

	public static async GetSource<T>(id: Guid, cls: { new(): T }): Promise<T> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		let doc: T

		try {
			const { response } = await client.get(cls, id.toString())
			doc = response._source
		}
		catch (error) {
			//return new cls() as T;
			return null;
		}
		return doc
	}

	public static async GetMany<T>(type: IndexedClass<T>) : Promise<Array<T>> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		const { documents } = await client.search(type, { body: { query: { match_all: {} } } })
		return documents
	}

	public static async Search<T>(type: IndexedClass<T>, query: any) : Promise<Array<T>> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		const { documents } = await client.search(type, { body: query })
		return documents ?? null
	}

	public static async Put<T>(document: T) : Promise<T> {

		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		await client.index(document)

		return document;
	}

	public static async Update<T>(document: T) : Promise<void> {
		const client = await ClientBuilder.GetClient(config.ELASTIC_URL)
		await client.update(document)
		return
	}

	public static QueueOperation(operation: (...args: any[]) => void, ...args: any[]) {
		this.queue.push(new Promise((resolveOuter) => {
			resolveOuter(
				new Promise((resolveInner) => {
					operation(...args)
					setTimeout(resolveInner, 0);
				})
			);
		}))
		return args
	}


	public static ResolveQueue(timeout: number) {
		const item = this.queue[0]
		if (item) {
			Promise.resolve(item)
		}
		setTimeout(() => {
			this.ResolveQueue(timeout)
        }, timeout)
    }
}