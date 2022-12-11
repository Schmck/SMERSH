import { Route } from '../'

export class LayoutRoute extends Route {
    private constructor(method: string, action: string) {
        super(method, action)
    }

    public static GetLayout: LayoutRoute = new LayoutRoute('GET', "/settings/campaign")

    public static PostLayout: LayoutRoute = new LayoutRoute('POST', "/settings/campaign")

    public static PatchLayout: LayoutRoute = new LayoutRoute('PATCH', "/settings/campaign")
}