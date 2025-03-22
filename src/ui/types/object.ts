import { TType, TPosition, TSize, TStyle } from "./property";
import { VarientType } from "../lib/TIcon";

// 오브젝트 인터페이스
export class TObj {
    public readonly type!: keyof typeof TType;
    public varient!: keyof typeof VarientType;

    public visible?: boolean = true;

    public position!: TPosition;
    public size!: TSize;

    public style!: TStyle;

    public text!: string;
}
