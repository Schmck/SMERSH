import { Guid } from 'guid-typescript'
import { ClientBuilder } from './ClientBuilder'
import { IndexedClass } from '../SMERSH/Utilities/types'
import { Elasticsearch } from '../SMERSH/Utilities'

const config = process.env;

export class SearchClient {

	public static queue: Array<Promise<any>> = []

	public static env = () => {
		console.log(process.env)
		return process.env;
	};

	public static client: Elasticsearch = ClientBuilder.GetClient(JSON.parse(process.env)["ELASTIC_URL"]);

	public static async Exists<T>(id: string, cls: { new(): T }) { 
		try {
			await this.client.get(cls, id)
			return true
		}
		catch (error) {
			return false;
		}
    }

	public static async Get<T>(id: Guid, cls: { new(): T }): Promise<T> {
		let doc : T

		try {
			const { document } = await this.client.get(cls, id.toString())
			doc = document
		}
		catch (error) {
			//return new cls() as T;
			return null;
        }
		return doc
	}

	public static async GetSource<T>(id: Guid, cls: { new(): T }): Promise<T> {
		let doc: T

		try {
			const { response } = await this.client.get(cls, id.toString())
			doc = response._source
		}
		catch (error) {
			//return new cls() as T;
			return null;
		}
		return doc
	}

	public static async GetMany<T>(type: IndexedClass<T>) : Promise<Array<T>> {
		const { documents } = await this.client.search(type, { body: { query: { match_all: {} } } })
		return documents
	}

	public static async Search<T>(type: IndexedClass<T>, query: any) : Promise<Array<T>> {
		const { documents } = await this.client.search(type, { body: query })
		return documents ?? null
	}

	public static async Put<T>(document: T) : Promise<T> {
		await this.client.index(document)

		return document;
	}

	public static async Update<T>(document: T) : Promise<T> {
		return this.client.update(document);
	}

	public static async Count<T>(index: IndexedClass<T>) {
		const count = await this.client.count<T>(index)
		return count;
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