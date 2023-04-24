export class Enumeration {
    protected constructor(value: number, displayName: string) {
        this.Value = value
        this.DisplayName = displayName
    }

    public Value: number;
    public DisplayName: string;


    public static getAll<T extends Enumeration>(): T[] {
        const enums: T[] = Object.getOwnPropertyNames(this).slice(3).map(role => this[role])
        return enums
    }

    public static fromValue<T extends Enumeration>(value: number) : T {
        return this.getAll<T>().find(obj => obj.Value === value)
    }

    public static fromDisplayName<T extends Enumeration>(displayName: string) : T {
        return this.getAll<T>().find(obj => obj.DisplayName === displayName)
    }
}
