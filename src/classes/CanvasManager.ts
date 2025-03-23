import { VarientType } from "../ui/lib/TIcon";
import type { TObj } from "../ui/types/object";
import chalk from "chalk";

// 키 모음
export enum Key {
    EXIT = "\u0003",
    ESC = "\x1b",

    ENTER = "\r",
    BACKSPACE = "\x7f",

    ARROW_UP = "\x1B[A",
    ARROW_DOWN = "\x1B[B",
    ARROW_RIGHT = "\x1B[C",
    ARROW_LEFT = "\x1B[D",
}

// 이벤트 리스너 인터페이스
export interface Listener {
    keydown?: (input: string) => void;
}

interface CanvasManagerProps {
    init: {
        objects: TObj[];
        listener?: Listener;
    };
}

// 캔버스 매니저
export class CanvasManager {
    public objects!: TObj[];
    public listener?: Listener;

    public constructor({ init }: CanvasManagerProps) {
        this.objects = init.objects;
        this.listener = init.listener;
        this.event();
    }

    // 커서 관련 메서드
    public cursor = {
        show: () => process.stdout.write("\x1B[?25h"),
        hide: () => process.stdout.write("\x1B[?25l"),
        clear: () => process.stdout.write("\u001B[2J\u001B[0;0H"),
        reset: () => process.stdout.write("\x1B[0;0H"),
        move: (x: number, y: number) => process.stdout.write(`\x1B[${y};${x}H`),
    };

    // 이벤트 관리
    protected event() {
        process.stdin.setEncoding("utf8");
        process.stdin.setRawMode(true);
        process.stdin.on("data", (chunk) => {
            const input = chunk.toString("utf8");
            this.listener?.keydown?.(input);
        });
    }

    // 텍스트 메서드
    private text(text: string, maxWidth: number): string[] {
        const rawLines = text.split("\n");
        const lines: string[] = [];

        for (const rawLine of rawLines) {
            const words = rawLine.split(" ");
            let currentLine = "";

            for (const word of words) {
                if (currentLine.length === 0) currentLine = word;
                else if (currentLine.length + 1 + word.length <= maxWidth)
                    currentLine += " " + word;
                else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }

            if (currentLine.length > 0) lines.push(currentLine);
        }

        return lines;
    }

    // 그리기
    public flip() {
        this.cursor.clear();

        for (const object of this.objects) {
            if (object.type === "icon") {
                const art: string[] = VarientType[object.varient].split("\n");

                const { x, y } = object.position;
                const { width, height } = object.size;
                const artHeight = art.length;
                const artWidth = Math.max(...art.map((line) => line.length));

                const offsetX = x + Math.floor((width - artWidth) / 2);
                const offsetY = y + Math.floor((height - artHeight) / 2);

                for (let i = 0; i < art.length; i++) {
                    this.cursor.move(offsetX, offsetY + i);
                    process.stdout.write(art[i]);
                }

                continue;
            }

            const { x, y } = object.position;
            const { width, height } = object.size;
            const { background, border, padding } = object.style;

            const bgStyle =
                background && background.color
                    ? "bg" +
                      background.color.charAt(0).toUpperCase() +
                      background.color.slice(1)
                    : "";

            const padTop = padding?.top || 0;
            const padBottom = padding?.bottom || 0;
            const padLeft = padding?.left || 0;
            const padRight = padding?.right || 0;

            let textLines: string[] = [];
            if (object.type === "label" && object.text) {
                const availableWidth = border ? width - 2 : width;
                textLines = this.text(
                    object.text,
                    availableWidth - (padLeft + padRight),
                );
            }

            if (border) {
                border.position = border.position ?? {
                    top: true,
                    bottom: true,
                    left: true,
                    right: true,
                };
            }

            if (border && border.position) {
                const bp = border.position;

                const offsetTop = bp.top ? 1 : 0;
                const offsetBottom = bp.bottom ? 1 : 0;
                const offsetLeft = bp.left ? 1 : 0;
                const offsetRight = bp.right ? 1 : 0;

                const innerWidth = width - offsetLeft - offsetRight;
                const innerHeight = height - offsetTop - offsetBottom;
                const verticalTextOffset = Math.floor(
                    (innerHeight - textLines.length) / 2,
                );

                const borderColor = border.color;
                const instyle = {
                    w: "─",
                    tl: "┌",
                    tr: "┐",
                    bl: "└",
                    br: "┘",
                    h: "│",
                };
                if (border.type === "dotted") {
                    instyle.w = "┄";
                    instyle.h = "┆";
                } else if (border.type === "double") {
                    instyle.w = "═";
                    instyle.tl = "╔";
                    instyle.tr = "╗";
                    instyle.bl = "╚";
                    instyle.br = "╝";
                    instyle.h = "║";
                }

                if (bp.top) {
                    const leftCorner = bp.left ? instyle.tl : instyle.w;
                    const rightCorner = bp.right ? instyle.tr : instyle.w;
                    const horizontalLength =
                        width - (bp.left ? 1 : 0) - (bp.right ? 1 : 0);
                    const horizontal = instyle.w.repeat(horizontalLength);
                    const topBorder = leftCorner + horizontal + rightCorner;
                    this.cursor.move(x, y);
                    process.stdout.write(
                        background
                            ? chalk`{${bgStyle} {${borderColor} ${topBorder}}}`
                            : chalk`{${borderColor} ${topBorder}}`,
                    );
                }

                for (let i = 0; i < innerHeight; i++) {
                    this.cursor.move(x, y + offsetTop + i);
                    const leftBorderChar = bp.left ? instyle.h : "";
                    const rightBorderChar = bp.right ? instyle.h : "";
                    let content = "";

                    if (i >= padTop && i < innerHeight - padBottom) {
                        const textAreaRowIndex = i - padTop;
                        if (
                            textAreaRowIndex >= verticalTextOffset &&
                            textAreaRowIndex <
                                verticalTextOffset + textLines.length
                        ) {
                            const lineIndex =
                                textAreaRowIndex - verticalTextOffset;
                            const textLine = textLines[lineIndex];
                            const availableTextWidth =
                                innerWidth - padLeft - padRight;
                            const leftTextPadding = Math.floor(
                                (availableTextWidth - textLine.length) / 2,
                            );
                            const rightTextPadding =
                                availableTextWidth -
                                textLine.length -
                                leftTextPadding;
                            content =
                                " ".repeat(padLeft) +
                                " ".repeat(leftTextPadding) +
                                textLine +
                                " ".repeat(rightTextPadding) +
                                " ".repeat(padRight);
                        } else {
                            content =
                                " ".repeat(padLeft) +
                                " ".repeat(innerWidth - padLeft - padRight) +
                                " ".repeat(padRight);
                        }
                    } else {
                        content = " ".repeat(innerWidth);
                    }
                    const middleLine =
                        leftBorderChar + content + rightBorderChar;
                    process.stdout.write(
                        background
                            ? chalk`{${bgStyle} {${borderColor} ${middleLine}}}`
                            : chalk`{${borderColor} ${middleLine}}`,
                    );
                }

                if (bp.bottom) {
                    const leftCorner = bp.left ? instyle.bl : instyle.w;
                    const rightCorner = bp.right ? instyle.br : instyle.w;
                    const horizontalLength =
                        width - (bp.left ? 1 : 0) - (bp.right ? 1 : 0);
                    const horizontal = instyle.w.repeat(horizontalLength);
                    const bottomBorder = leftCorner + horizontal + rightCorner;
                    this.cursor.move(x, y + height - 1);
                    process.stdout.write(
                        background
                            ? chalk`{${bgStyle} {${borderColor} ${bottomBorder}}}`
                            : chalk`{${borderColor} ${bottomBorder}}`,
                    );
                }

                this.cursor.reset();
            } else {
                for (let i = 0; i < height; i++) {
                    this.cursor.move(x, y + i);
                    let content = "";
                    if (i >= padTop && i < height - padBottom) {
                        const textAreaRowIndex = i - padTop;
                        if (
                            object.type === "label" &&
                            object.text &&
                            textAreaRowIndex >=
                                Math.floor(
                                    (height -
                                        padTop -
                                        padBottom -
                                        textLines.length) /
                                        2,
                                ) &&
                            textAreaRowIndex <
                                Math.floor(
                                    (height -
                                        padTop -
                                        padBottom -
                                        textLines.length) /
                                        2,
                                ) +
                                    textLines.length
                        ) {
                            const lineIndex =
                                textAreaRowIndex -
                                Math.floor(
                                    (height -
                                        padTop -
                                        padBottom -
                                        textLines.length) /
                                        2,
                                );
                            const textLine = textLines[lineIndex];
                            const availableTextWidth =
                                width - padLeft - padRight;
                            const leftTextPadding = Math.floor(
                                (availableTextWidth - textLine.length) / 2,
                            );
                            const rightTextPadding =
                                availableTextWidth -
                                textLine.length -
                                leftTextPadding;
                            content =
                                " ".repeat(padLeft) +
                                " ".repeat(leftTextPadding) +
                                textLine +
                                " ".repeat(rightTextPadding) +
                                " ".repeat(padRight);
                        } else {
                            content =
                                " ".repeat(padLeft) +
                                " ".repeat(width - padLeft - padRight) +
                                " ".repeat(padRight);
                        }
                    } else {
                        content = " ".repeat(width);
                    }
                    process.stdout.write(
                        background
                            ? chalk`{${bgStyle} ${content}}`
                            : object.style.color
                              ? chalk`{${object.style.color} ${content}}`
                              : content,
                    );
                }
                this.cursor.reset();
            }
        }
    }
}
