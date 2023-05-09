import { Arrays } from './Arrays'

export class Parsers {
    public static parseTable(table: HTMLTableElement) {
        const headers = Object.values((table).tHead.children).map(row => {
            return Object.values(row.children).map(item => {
                return item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', 'Team')
            })


        })[0]
        const values = Object.values((table).tBodies[0].children).map(item => {
            return Object.values(item.children).map(row => {
                return row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
            })
        })
        const result: any = { headers, values }

        return result.values.map(value => {
            return Object.fromEntries(value.map((val, index) => {
                let vl = val

                if(vl === 'Yes') {
                    vl = true
                }

                if(vl === 'No') {
                    vl = false;
                }

                if(Number.isInteger(parseInt(vl))) {
                    vl = parseInt(vl)
                }
                return [[result.headers[index].replace(' ', '')], vl]
            }))
        })
    }

    public static playerTable(table: HTMLTableElement) {
        const headers = Object.values((table).tHead.children).map(row => {
            return Object.values(row.children).map(item => {
                return item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', 'Team')
            })
        })[0]
        headers.pop();
        headers.push('PlayerKey');
        const values = Object.values((table).tBodies[0].children).map(item => {
            return Object.values(item.children).map(row => {
                if (row.querySelector("input[name='playerid']")) {
                    let input = row.querySelector("input[name='playerkey']")['value']
                    return [input, row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')]
                }
                return row.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', '')
            }).flat()
        }).map((val: any) => { val.pop(); return val })
        const result: any = { headers, values }

        return result.values.map(value => {
            return Object.fromEntries(value.map((val, index) => {
                let header = result.headers[index].toString()
                let vl = val

                if (!header.includes('Player name')) {
                    if (vl === 'Yes') {
                        vl = true
                    }

                    if (vl === 'No') {
                        vl = false;
                    }
                }
               

                if(Number.isInteger(parseInt(vl)) && !header.includes('Player name') && !header.includes('PlayerKey') && !header.includes('Unique ID') && !header.includes('IP')) {
                    vl = parseInt(vl)
                }
                return [[header.replace(' ', '')], vl]
            }))
        }).sort((a, b) => a.Playername.toString().localeCompare(b.Playername.toString()))
    }

    public static dlElement(dl: Element) {
        const items = Array.prototype.slice.call(dl.children).map(item => item.innerHTML.replace(/(<([^>]+)>)/ig, '').replace('&nbsp;', ''))
        const paired = Arrays.chunk(items, 2).map(([key, value]) => ([
            key.replace(/\s+/g, ""),
            value
        ]));
        return Object.fromEntries(paired);
    }
}