import { AxiosRequestConfig } from 'axios';
import { Logger } from '../../Discord/Framework';
import { SearchClient } from '../../Elastic';
import { LayoutSearchReport } from '../../Reports/Entities/layout';
import { Status } from '../../Services/WebAdmin/Models'
import { StatusQuery } from '../../Services/WebAdmin/Queries';
import { LayoutRoute } from '../../Services/WebAdmin/Routes';
import { Layout } from '../../SMERSH/ValueObjects';
import { Api } from '../../Web/Framework';
import { Watcher } from '../Watcher'

export class LayoutWatcher extends Watcher {


    public override async Watch(timeout = 60000, ...args: Array<{ status: Status, activeLayout: string, playerCountTrend: Array<number> }>) {
        const status = await StatusQuery.Get();
        const prevStatus = args[0] && args[0].status;
        let activeLayout = (args[0] && args[0].activeLayout) || ''
        let lastLayout = (args[0] && args[0].activeLayout) || '' 
        let playerCountTrend = []

        if (status) {
            let layouts = await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
                "query": {
                    "match_all": {}
                }
            })
            let dormantLayouts = layouts

            if (args[0] && args[0].playerCountTrend) {
                const oldTrend = args[0].playerCountTrend.length > 2 ? args[0].playerCountTrend.slice(1) : args[0].playerCountTrend;
                playerCountTrend = [...oldTrend, status.Players.filter(p => !p.Bot).length];
            } else {
               playerCountTrend =  [status.Players.filter(p => !p.Bot).length]
            }

            if (activeLayout) {
                layouts = layouts.filter(layout => layout.Name !== activeLayout)
            }
            

            if (playerCountTrend.length > 2) {
                dormantLayouts.every(async layout => {
                    let changeLayout = false;

                    if (activeLayout !== layout.Name) {
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
                            activeLayout = layout.Name;
                        }

                        if (!changeLayout && startTime.getHours() <= date.getHours() && endTime.getHours() >= date.getHours()) {
                            changeLayout = true
                            activeLayout = layout.Name;
                        }

                        if (layout.Name === Layout.Stock.DisplayName) {
                            const startTimeNight = this.addHours(startTime, 12)
                            const endTimeNight = this.addHours(startTime, 12)

                            if (startTimeNight.getHours() <= date.getHours() && endTimeNight.getHours() >= date.getHours()) {
                                changeLayout = true
                                activeLayout = layout.Name;
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
                                    if (lastLayout) {
                                        activeLayout = lastLayout;
                                    }
                                }

                                if (layout.Name === Layout.Stock.DisplayName) {
                                    const startTimeNight = this.addHours(startTime, 12)
                                    const endTimeNight = this.addHours(startTime, 12)

                                    if (startTimeNight.getHours() <= date.getHours() && endTimeNight.getHours() >= date.getHours()) {
                                        changeLayout = false
                                        if (lastLayout) {
                                            activeLayout = lastLayout;
                                        }
                                    }

                                }
                                return changeLayout;
                            })
                        }

                        if (changeLayout && (!activeLayout || (activeLayout !== lastLayout))) {
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

                            Object.fromEntries(Object.values(layout.Maps).map((territory: string[], index) => {
                                const key = env["GAME"] && env["GAME"] === 'RO2' ? `sg_territory_` : `pt_territory_`

                                urlencoded.append(key + index, territory.join('\n'))
                                urlencoded.append(`${key}1${index}`, ['', '', ''].join('\n'))
                                return [key + index, territory]
                            }))

                            for (let i = 0; i < 10; i++) {
                                const altKey = env["GAME"] && env["GAME"] === 'RO2' ? `pt_territory_` : `sg_territory_`

                                urlencoded.append(`${altKey}1${i}`, ['', '', ''].join('\n'))

                            }

                            Logger.append(`switching to ${layout.Name} layout`)
                            urlencoded.append('save', 'save')
                            await client.post(url, urlencoded, config);
                            Logger.append(`changed to ${layout.Name} layout`)

                        }
                    }

                    return !changeLayout
                })
            }
        }



        setTimeout(() => {
            this.Watch(timeout, { status: status ?? prevStatus, playerCountTrend, activeLayout })
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