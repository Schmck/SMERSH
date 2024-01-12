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
        let playerCountTrend = (args[0] && args[0].playerCountTrend) || []

        if (status) {
            let layouts = await SearchClient.Search<LayoutSearchReport>(LayoutSearchReport, {
                "query": {
                    "match_all": {}
                }
            })
            //make a copy of the array not a direct reference
            let dormantLayouts = layouts.filter(l => l)

            if (playerCountTrend && playerCountTrend.length) {
                const oldTrend = playerCountTrend.length > 2 ? playerCountTrend.slice(1) : playerCountTrend;
                playerCountTrend = [...oldTrend, status.Players.filter(p => !p.Bot).length];
            } else {
               playerCountTrend =  [status.Players.filter(p => !p.Bot).length]
            }

            if (activeLayout) {
                dormantLayouts = layouts.filter(layout => layout.Name !== activeLayout)
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


                        console.log(date.getHours(),'1', layout.Name, higherThanMin, lowerThanMax, mapUnchanged)
                        if (higherThanMin && lowerThanMax && mapUnchanged) {
                            changeLayout = true;
                            activeLayout = layout.Name;
                        }

                        if (!changeLayout && date.getHours() >= startTime.getHours() && date.getHours() <= endTime.getHours()) {
                            changeLayout = true;
                            activeLayout = layout.Name;
                        }
                        if (layout.Name === Layout.Stock.DisplayName) {
                            const startTimeNight = this.addHours(startTime, 12);
                            const endTimeNight = this.addHours(endTime, 12);
                            if (date.getHours() >= startTimeNight.getHours() && date.getHours() <= endTimeNight.getHours()) {
                                changeLayout = true;
                                activeLayout = layout.Name;
                            }
                            console.log('stock at nighttime', date.getHours())

                            // else {
                            //     changeLayout = false;
                            //     activeLayout = lastLayout;
                            // }
                        }
                        if (changeLayout) {
                            const otherLayouts = layouts.filter(lt => lt.Id !== layout.Id);
                            //conflicts with schedules and playercount of other layouts
                            otherLayouts.every(lt => {
                                startTime.setHours(lt.StartTime);
                                endTime.setHours(lt.EndTime);
                                if (date.getHours() >= startTime.getHours() && date.getHours() <= endTime.getHours()) {
                                    changeLayout = false;
                                    if (lastLayout) {
                                        activeLayout = lastLayout;
                                    }
                                }
                                if (lt.Name === Layout.Stock.DisplayName) {
                                    const startTimeNight = this.addHours(startTime, 12);
                                    const endTimeNight = this.addHours(startTime, 12);
                                    if (date.getHours() >= startTimeNight.getHours() && date.getHours() <= endTimeNight.getHours()) {
                                        changeLayout = false;
                                        console.log('stock at nighttime check', date.getHours())
                                        if (lastLayout) {
                                            activeLayout = lastLayout;
                                        }
                                    }
                                }
                                if (!changeLayout) {
                                    const higherThanMin = this.atLeastTwo(playerCountTrend[0] >= lt.MinimumPlayerCount, playerCountTrend[1] >= lt.MinimumPlayerCount, playerCountTrend[2] >= lt.MinimumPlayerCount)
                                    const lowerThanMax = this.atLeastTwo(playerCountTrend[0] <= lt.MaximumPlayerCount, playerCountTrend[1] <= lt.MaximumPlayerCount, playerCountTrend[2] <= lt.MaximumPlayerCount)
                                    const mapUnchanged = this.atLeastTwo(playerCountTrend[0] !== 0, playerCountTrend[1] !== 0, playerCountTrend[2] !== 0)

                                    if (higherThanMin && lowerThanMax && mapUnchanged) {
                                        changeLayout = true;
                                        activeLayout = lt.Name;
                                    }
                                }
                                return changeLayout;
                            });
                        }

                        console.log(activeLayout, lastLayout)
                        if (changeLayout && activeLayout !== lastLayout) {
                            const env = JSON.parse(process.argv[process.argv.length - 1]);
                            const url = env["BASE_URL"] + LayoutRoute.PostLayout.Action;
                            const territoryIndex = env["GAME"] && env["GAME"] === 'RO2'
                                ? { "Steppe": 0, "Machetka": 1, "Traktorniy": 2, "Mamaev": 3, "Barrikady": 4, "Krasnyi": 5, "North": 6, "West": 7, "Central": 8, "South": 9 }
                                : { "Burma": 0, "Ryukyus": 1, "Volcanoes": 2, "Phillipines": 3, "Palau": 4, "Marianas": 5, "Marshalls": 6, "Gilberts": 7, "New Guinea": 8, "Solomons": 9 };
                            const theater = env["GAME"] && env["GAME"] === 'RO2' ? '0' : '1'
                            const gametype = env["GAME"] && env["GAME"] === 'RO2' ? 'ROGame.ROGameInfoTerritories' : 'RSGame.RSGameInfoTerritories'
                            const altKey = env["GAME"] && env["GAME"] === 'RO2' ? `pt_territory_` : `sg_territory_`
                            const altMaps = env["GAME"] && env["GAME"] === 'RO2' ? ['RSTE-Hanto', 'RSTE-Kwajalein', 'RSTE-Kobura_MCP'] : ['TE-Coldsteel_MCP', 'TE-CommissarsHouse', 'TE-Station']

                            const config: AxiosRequestConfig =
                            {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                            }

                            const urlencoded = new URLSearchParams();
                            urlencoded.append('campaignname', '')
                            urlencoded.append('territoryCount', '20')
                            urlencoded.append('currentTheater', theater)
                            urlencoded.append('viewingTheater', theater)
                            urlencoded.append('gametype', gametype)

                            const client = Api.axios();

                            Object.entries(layout.Maps).sort((a, b) => territoryIndex[a[0]] - territoryIndex[b[0]]).map(item => item[1]).forEach((territory: string[], index) => {
                                const key = env["GAME"] && env["GAME"] === 'RO2' ? `sg_territory_` : `pt_territory_`

                                urlencoded.append(key + index, `${territory.join('\n')}\n`)
                            })

                            for (let i = 10; i < 20; i++) {
                                urlencoded.append(`${altKey}${i}`, `${altMaps.join('\n')}\n`)
                            }


                            global.layout = layout;
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