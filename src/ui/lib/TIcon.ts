import type { TType, TPosition, TSize, TStyle } from "../types/property";
import { TObj } from "../types/object";

export enum VarientType {
    DIRECTORY = "┌─╲____┐\n│      │\n│      │\n└──────┘",
    FILE = " ╱─────┐\n╱ ╲    │\n╲ ╱    │\n └─────┘",
    TRASH = "  ┌┄┬┬┄┐\n ┌─┬──┬─┐\n ╲      ╱\n ┕━━━━━━┙",
}

interface TIconProps {
    varient: keyof typeof VarientType;

    position: TPosition;
    size: TSize;

    style?: TStyle;
}

// 아이콘 오브젝트
export class TIcon extends TObj {
    public readonly type: keyof typeof TType = "icon";
    public varient!: keyof typeof VarientType;

    public constructor(props: TIconProps) {
        super();

        this.varient = props.varient;

        this.position = props.position;
        this.size = props.size;

        this.style = props.style || {};
    }
}
