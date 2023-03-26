import { Watcher } from '../Watcher'
import { LiftBanCommand } from '../../Commands/Player'
import { Guid } from 'guid-typescript'
import { SearchClient } from '../../Elastic'
import { PolicySearchReport } from '../../Reports/Entities/policy';
import { Action } from '../../SMERSH/ValueObjects/player';
import { Api } from '../../Web/Framework'
import { PolicyRoute } from '../../Services/WebAdmin/Routes';
import { AxiosRequestConfig } from 'axios';

export class BanWatcher extends Watcher {

    public override async Watch(timeout = 60000, ...args: any[]) {
        const count = await SearchClient.Count<PolicySearchReport>(PolicySearchReport)
        const bans = await SearchClient.Search(PolicySearchReport, {
                "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "Action": Action.Ban.DisplayName,
                            }
                        },
                        {
                            "match": {
                                "IsActive": true
                            }
                        }
                    ]
                }
                },
                "size": count.count
            })

        const env = process.env;
        const axios = Api.axios();
        const url = env["BASE_URL"] + PolicyRoute.AddBan.Action

        for (let ban of bans) {
            this.log.info(JSON.stringify(ban))
            if (ban.UnbanDate && new Date(ban.UnbanDate) <= new Date()) {

                const urlencoded = new URLSearchParams();
                urlencoded.append("banId", `plainId:${ban.PlainId}`);
                urlencoded.append("action", "delete");
                const config: AxiosRequestConfig =
                {
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded"
                    },
                }

                axios.post(url, urlencoded, config).then(result => {
                    this.log.info(result)
                    return result
                });

                await this.commandBus.execute(new LiftBanCommand(Guid.parse(ban.Id), ban.PlayerId as any))
            }
        }

        setTimeout(() => {
            this.Watch(timeout)
        }, timeout)
    }
}