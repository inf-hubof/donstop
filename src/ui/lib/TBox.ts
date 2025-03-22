import type { TType, TPosition, TSize, TStyle } from "../types/property";
import { TObj } from "../types/object";

interface TBoxProps {
    position: TPosition;
    size: TSize;

    style?: TStyle;
}

// 박스 형태의 오브젝트
export class TBox extends TObj {
    public readonly type: keyof typeof TType = "box";

    public constructor(props: TBoxProps) {
        super();

        this.position = props.position;
        this.size = props.size;

        this.style = props.style || {};
    }
}
