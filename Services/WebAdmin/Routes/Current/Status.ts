import { Route } from '../'

export class StatusRoute extends Route {
    private constructor(method: string, action: string, section: string = '') {
        super(method, action, section)
    }

    public GetStatus: StatusRoute = new StatusRoute('GET', "/current",)

    public GetGameSection: StatusRoute = new StatusRoute('GET', "/current", "game")
    public GetRulesSection: StatusRoute = new StatusRoute('GET', "/current", "rules")
    public GetTeamsSection: StatusRoute = new StatusRoute('GET', "/current", "teams")
    public GetPlayersSection: StatusRoute = new StatusRoute('GET', "/current", "players")

}