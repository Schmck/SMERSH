import { Route } from '../'

export class StatusRoute extends Route {
    private constructor(method: string, action: string, section: string = '') {
        super(method, action, section)
    }

    public static GetStatus: StatusRoute = new StatusRoute('GET', "/current",)

    public static GetGameSection: StatusRoute = new StatusRoute('GET', "/current", "game")
    public static GetRulesSection: StatusRoute = new StatusRoute('GET', "/current", "rules")
    public static GetTeamsSection: StatusRoute = new StatusRoute('GET', "/current", "teams")
    public static GetPlayersSection: StatusRoute = new StatusRoute('GET', "/current", "players")

}