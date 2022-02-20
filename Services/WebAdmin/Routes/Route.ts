export class Route {
    protected constructor(method: string, action: string, section: string = '') {
        this.Method = method
        this.Action = action;
        this.Section = section;
    }

    public Action: string;

    public Section: string;

    public Method: string;
}