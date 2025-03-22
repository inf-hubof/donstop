// 타입 이넘
export enum TType {
    box,
    label,
    icon,
}

// 위치
export type TPosition = {
    x: number;
    y: number;
};

// 크기
export type TSize = {
    width: number;
    height: number;
};

export type TColor =
    | "gray"
    | "red"
    | "green"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "black"
    | "yellow";

// 스타일
export type TStyle = {
    border?: {
        type: "solid" | "dotted" | "double";
        position?: {
            top: boolean;
            bottom: boolean;
            left: boolean;
            right: boolean;
        };
        color: TColor;
    };
    background?: {
        color: TColor;
    };
    padding?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
};
