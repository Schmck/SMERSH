import { Enumeration } from '../'

export class Layout extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public Fill: Layout = new Layout(0, "long maps only")

    public Stock: Layout = new Layout(1, "stock maps only")

    public Regular: Layout = new Layout(2, "a mix of custom and stock maps")

    public Custom: Layout = new Layout(3, "more rare custom maps compared to regular")
}