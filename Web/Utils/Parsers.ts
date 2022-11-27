import { Arrays } from './Arrays'

export class Parsers {
    public static parseTable(table: HTMLTableElement) {
        const headers = Object.values((table).tHead.children).map(row => {
            return Object.values(row.children).map(item => {
                return item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', 'Team')
            })


        })
        const values = Object.values((table).tBodies[0].children).map(item => {
            return Object.values(item.children).map(row => {
                return row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
            })
        }).map((val: any) => { val.pop(); return val })
        const result: any = { headers, values }

        return result.values.map(value => {
            return Object.fromEntries(value.map((val, index) => {
                return [[result.headers[0][index].replace(' ', '')], val]
            }))
        })
    }

    public static playerTable(table: HTMLTableElement) {
        const headers = Object.values((table).tHead.children).map(row => {
            return Object.values(row.children).map(item => {
                return item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', 'Team')
            })


        })
        const values = Object.values((table).tBodies[0].children).map(item => {
            return Object.values(item.children).map(row => {
                return row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
            })
        }).map((val: any) => { val.pop(); return val })
        const result: any = { headers, values }

        return result.values.map(value => {
            return Object.fromEntries(value.map((val, index) => {
                return [[result.headers[0][index].replace(' ', '')], val]
            }))
        }).sort((a, b) => a.Playername.localeCompare(b.Playername))
    }

    public static dlElement(dl: Element) {
        const items = Array.prototype.slice.call(dl.children).map(item => item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', ''))
        const paired = Arrays.chunk(items, 2);
        return Object.fromEntries(paired);
    }
}