export class Enumeration {
    protected constructor(value: number, displayName: string) {
        this.Value = value
        this.DisplayName = displayName
    }

    public Value: number;
    public DisplayName: string;


    public static getAll() {
        return Object.values(this).filter(obj => typeof obj !== 'function')
    }

    public static fromValue<T>(value: number) : T {
        return this.getAll().find(obj => obj.Value === value)
    }

    public static fromDisplayName<T>(displayName: string) : T {
        return this.getAll().find(obj => obj.DisplayName === displayName)
    }
}
