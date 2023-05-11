import { Enumeration } from '../'

export class Layout extends Enumeration {
    public constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    //long maps only
    public static Fill: Layout = new Layout(0, "fill")

    //stock maps only
    public static Stock: Layout = new Layout(1, "stock")

    //a mix of custom and stock maps
    public static Regular: Layout = new Layout(2, "regular")

    //more rare custom maps compared to regular
    public static Custom: Layout = new Layout(3, "custom")
}