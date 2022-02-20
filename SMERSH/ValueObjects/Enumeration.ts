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

    public static fromValue(value: number) {
        return this.getAll().find(obj => obj.Value === value)
    }

    public static fromDisplayName(displayName: string) {
        return this.getAll().find(obj => obj.DisplayName === displayName)
    }
}
