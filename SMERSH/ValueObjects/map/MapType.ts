import { Enumeration } from '../'

export class MapType extends Enumeration {
    private constructor(value: number, displayName: string) {
        super(value, displayName)
    }

    public CQB: MapType = new MapType(0, "Close quarters combat")

    public Open: MapType = new MapType(1, "Wide and open")

    public Diverse: MapType = new MapType(2, "Diverse terrain, from forests to cityscapes")

}