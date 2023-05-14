import { AxiosRequestConfig } from 'axios';
import { SearchClient } from '../../Elastic';
import { LayoutSearchReport } from '../../Reports/Entities/layout';
import { Status } from '../../Services/WebAdmin/Models'
import { StatusQuery } from '../../Services/WebAdmin/Queries';
import { LayoutRoute } from '../../Services/WebAdmin/Routes';
import { Layout } from '../../SMERSH/ValueObjects';
import { Api } from '../../Web/Framework';
import { Watcher } from '../Watcher'

export class LayoutWatcher extends Watcher {


    public override async Watch(timeout = 60000, ...args: Array<{ status: Status, playerCountTrend: Array<number> }>) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0].status;
        let playerCountTrend = []

        if (status) {
            playerCountTrend = args[0] && args[0].playerCountTrend ? [...args[0].playerCountTrend.slice(1), status.Players.filter(p => !p.Bot).length] : [];
            const layouts = await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
                "query": {
                    "match_all": {}
                }
            })

            if (playerCountTrend.length > 3) {
                layouts.every(async layout => {
                    let changeLayout = false;
                    const date = new Date();
                    const startTime = new Date();
                    const endTime = new Date();
                    const higherThanMin = this.atLeastTwo(playerCountTrend[0] >= layout.MinimumPlayerCount, playerCountTrend[1] >= layout.MinimumPlayerCount, playerCountTrend[2] >= layout.MinimumPlayerCount)
                    const lowerThanMax = this.atLeastTwo(playerCountTrend[0] <= layout.MaximumPlayerCount, playerCountTrend[1] <= layout.MaximumPlayerCount, playerCountTrend[2] <= layout.MaximumPlayerCount)
                    const mapUnchanged = this.atLeastTwo(playerCountTrend[0] !== 0, playerCountTrend[1] !== 0, playerCountTrend[2] !== 0)

                    startTime.setHours(layout.StartTime)
                    endTime.setHours(layout.EndTime)

                    if (higherThanMin && lowerThanMax && mapUnchanged) {
                        changeLayout = true
                    }

                    if (!changeLayout && startTime.getHours() <= date.getHours() && endTime.getHours() >= date.getHours()) {
                        changeLayout = true
                    }

                    if (layout.Name === Layout.Stock.DisplayName) {
                        const startTimeNight = this.addHours(startTime, 12)
                        const endTimeNight = this.addHours(startTime, 12)

                        if (startTimeNight.getHours() <= date.getHours() && endTimeNight.getHours() >= date.getHours()) {
                            changeLayout = true
                        }

                    }

                    if (changeLayout) {
                        const otherLayouts = layouts.filter(lt => lt.Id !== layout.Id)
                        //conflicts with schedules of other layouts
                        otherLayouts.every(lt => {
                            startTime.setHours(lt.StartTime)
                            endTime.setHours(lt.EndTime)
                            if (startTime.getHours() <= date.getHours() && endTime.getHours() >= date.getHours()) {
                                changeLayout = false
                            }

                            if (layout.Name === Layout.Stock.DisplayName) {
                                const startTimeNight = this.addHours(startTime, 12)
                                const endTimeNight = this.addHours(startTime, 12)

                                if (startTimeNight.getHours() <= date.getHours() && endTimeNight.getHours() >= date.getHours()) {
                                    changeLayout = false
                                }

                            }
                        })
                    }

                    if (changeLayout) {

                        const env = JSON.parse(process.argv[process.argv.length - 1]);
                        const url = env["BASE_URL"] + LayoutRoute.PostLayout.Action
                        const theater = env["GAME"] && env["GAME"] === 'RO2' ? '0' : '1'
                        const config: AxiosRequestConfig =
                        {
                            headers: {
                                "Content-type": "application/x-www-form-urlencoded"
                            },
                        }

                        const urlencoded = new URLSearchParams();
                        urlencoded.append('campaignname', '')
                        urlencoded.append('territoryCount', '20')
                        urlencoded.append('currentTheater', theater)
                        urlencoded.append('viewingTheater', theater)

                        const client = Api.axios();

                        Object.fromEntries(Object.values(layout).map((territory: string[], index) => {
                            const key = env["GAME"] && env["GAME"] === 'RO2' ? `sg_territory_` : `pt_territory_`

                            urlencoded.append(key + index, territory.join('\n'))
                            urlencoded.append(`${key}1${index}`, ['', '', ''].join('\n'))
                            return [key + index, territory]
                        }))

                        for (let i = 0; i < 10; i++) {
                            const altKey = env["GAME"] && env["GAME"] === 'RO2' ? `pt_territory_` : `sg_territory_`

                            urlencoded.append(`${altKey}1${i}`, ['', '', ''].join('\n'))

                        }
                        urlencoded.append('save', 'save')
                        await client.post(url, urlencoded, config);
                    }

                    return !changeLayout
                })
            }
        }



        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, playerCountTrend })
        }, timeout)
    }

    public addHours(date, hours) {
        const newDate = new Date(date)
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    }

    public atLeastTwo = (a, b, c) => {
        return a ? (b || c) : (b && c)
    }
}