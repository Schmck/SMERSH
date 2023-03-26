import { Route } from '..'

export class PolicyRoute extends Route {
    private constructor(method: string, action: string) {
        super(method, action)
    }

    public static GetBans: PolicyRoute = new PolicyRoute('GET', "/policy/bans")

    public static DeleteBan: PolicyRoute = new PolicyRoute('POST', "/policy/bans")

    public static AddBan: PolicyRoute = new PolicyRoute('POST', "/policy/bans")

}