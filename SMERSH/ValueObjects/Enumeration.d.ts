export declare class Enumeration {
    protected constructor(value: number, displayName: string);
    Value: number;
    DisplayName: string;
    static getAll(): any[];
    static fromValue(value: number): any;
    static fromDisplayName(displayName: string): any;
}
