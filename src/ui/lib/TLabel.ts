import type { TType, TPosition, TSize, TStyle } from "../types/property";
import { TObj } from "../types/object";

interface TBoxProps {
    position: TPosition;
    size?: TSize;

    style?: TStyle;

    text: string;
}

// 텍스트 형태의 오브젝트
export class TLabel extends TObj {
    public readonly type: keyof typeof TType = "label";
    public text!: string;

    public constructor(props: TBoxProps) {
        super();

        this.position = props.position;
        this.size = props.size || {
            width: Math.max(...props.text.split("\n").map((x) => x.length)) + 2,
            height: props.text.split("\n").length + 2,
        };

        this.style = props.style || {};

        this.text = props.text;
    }
}
