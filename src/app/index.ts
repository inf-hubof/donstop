import { CanvasManager, Key } from "../classes/CanvasManager";
import { TBox, TIcon, TLabel } from "../ui";
import type { TObj } from "../ui/types/object";

const SCREEN_WIDTH = process.stdout.columns;
const SCREEN_HEIGHT = process.stdout.rows;

interface FileEntry {
    type: "DIRECTORY" | "FILE" | "PARENT" | "TRASH";
    name: string;
    children?: FileEntry[];
}

const structure: FileEntry = {
    type: "DIRECTORY",
    name: "(root)",
    children: [
        {
            type: "DIRECTORY",
            name: "src",
            children: [
                { type: "FILE", name: "index.ts" },
                { type: "FILE", name: ".eslintrc" },
                { type: "FILE", name: "umm.txt" },
            ],
        },
        { type: "FILE", name: "README.md" },
        { type: "FILE", name: "package.json" },
        { type: "FILE", name: "contribute" },
    ],
};

const trashFolder: FileEntry = {
    type: "TRASH",
    name: "(trash)",
    children: [],
};

let currentStructure: FileEntry = structure;
const structureStack: FileEntry[] = [];
let structureCurrentId: number | null = 0;

let modalOpen = false;
let modalSelected = 1;
let modalItemIndex: number | null = null;

const createStructureItems = (): TObj[] => {
    let children: FileEntry[] = currentStructure.children
        ? [...currentStructure.children]
        : [];

    if (structureStack.length > 0)
        children = [{ type: "PARENT", name: ".." }, ...children];

    if (structureStack.length === 0 && currentStructure.type !== "TRASH")
        children = [{ type: "TRASH", name: "(trash)" }, ...children];

    return children.reduce(
        (prev, child, idx) => [
            ...prev,

            new TBox({
                position: { x: 5 + idx * 14, y: 4 },
                size: { width: 12, height: 6 },
                style:
                    structureCurrentId === idx
                        ? { border: { type: "solid", color: "cyan" } }
                        : undefined,
            }),
            new TIcon({
                varient: child.type === "PARENT" ? "DIRECTORY" : child.type,
                position: { x: 5 + idx * 14, y: 4 },
                size: { width: 12, height: 6 },
            }),
            new TLabel({
                position: { x: 5 + idx * 14, y: 10 },
                size: { width: 12, height: 1 },
                text: child.name,
            }),
        ],
        [] as TObj[],
    );
};

const createModalComponents = (): TObj[] => {
    if (!modalOpen) return [];

    const modalWidth = 30;
    const modalHeight = 7;
    const modalX = Math.floor((SCREEN_WIDTH - modalWidth) / 2);
    const modalY = Math.floor((SCREEN_HEIGHT - modalHeight) / 2);

    return [
        new TBox({
            position: { x: modalX, y: modalY },
            size: { width: modalWidth, height: modalHeight },
            style: { border: { type: "double", color: "red" } },
        }),
        new TLabel({
            position: { x: modalX + 2, y: modalY + 2 },
            size: { width: modalWidth - 4, height: 1 },
            text: "Real?",
        }),

        new TLabel({
            position: { x: modalX + 5, y: modalY + 4 },
            size: { width: 5, height: 1 },
            text: modalSelected === 0 ? "[no]" : "no",
        }),
        new TLabel({
            position: { x: modalX + 20, y: modalY + 4 },
            size: { width: 5, height: 1 },
            text: modalSelected === 1 ? "[yes]" : "yes",
        }),
    ];
};

const components = {
    container: [
        new TBox({
            position: { x: 1, y: 1 },
            size: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
            style: { border: { type: "solid", color: "gray" } },
        }),
        new TLabel({
            position: { x: 5, y: 2 },
            size: { width: "desktop".length, height: 1 },
            style: { color: "cyan" },
            text: "desktop",
        }),
    ],
    tutorial: [
        new TBox({
            position: { x: Math.floor(SCREEN_WIDTH / 4) * 3 - 1, y: 2 },
            size: {
                width: Math.ceil(SCREEN_WIDTH / 4),
                height: SCREEN_HEIGHT - 2,
            },
            style: { border: { type: "double", color: "gray" } },
        }),
        ...(() => {
            const tutorialItems = [
                "move: ← →",
                "click: enter ↵",
                "remove: backspace ↤",
            ];
            return tutorialItems.map(
                (item, idx) =>
                    new TLabel({
                        position: {
                            x: Math.floor(SCREEN_WIDTH / 4) * 3 + 3,
                            y: 4 + idx * 2,
                        },
                        size: { width: item.length, height: 1 },
                        text: item,
                    }),
            );
        })(),
    ],
    structureItems: createStructureItems(),
};

const manager = new CanvasManager({
    init: {
        objects: [
            ...components.container,
            ...components.tutorial,
            ...components.structureItems,
        ],
        listener: {
            keydown(input) {
                if (modalOpen) {
                    switch (input) {
                        case Key.ARROW_LEFT:
                            modalSelected = Math.max(0, modalSelected - 1);
                            break;

                        case Key.ARROW_RIGHT:
                            modalSelected = Math.min(1, modalSelected + 1);
                            break;

                        case Key.ENTER:
                            if (modalSelected === 1 && modalItemIndex !== null)
                                trashFolder.children?.splice(modalItemIndex, 1);

                            modalOpen = false;
                            modalItemIndex = null;
                            break;

                        case Key.ESC:
                            modalOpen = false;
                            modalItemIndex = null;
                            break;
                    }

                    manager.objects = [
                        ...components.container,
                        ...components.tutorial,
                        ...createStructureItems(),
                        ...createModalComponents(),
                    ];
                    return;
                }

                let children: FileEntry[] = currentStructure.children
                    ? [...currentStructure.children]
                    : [];

                if (structureStack.length > 0)
                    children = [{ type: "PARENT", name: ".." }, ...children];

                if (
                    structureStack.length === 0 &&
                    currentStructure.type !== "TRASH"
                )
                    children = [
                        { type: "TRASH", name: "(trash)" },
                        ...children,
                    ];

                const childrenLength = children.length;

                if (input === Key.EXIT) {
                    manager.cursor.show();
                    process.exit();
                }

                switch (input) {
                    case Key.ARROW_LEFT: {
                        if (structureCurrentId === null) structureCurrentId = 0;
                        structureCurrentId = Math.max(
                            0,
                            structureCurrentId - 1,
                        );
                        break;
                    }

                    case Key.ARROW_RIGHT: {
                        if (structureCurrentId === null) structureCurrentId = 0;
                        structureCurrentId = Math.min(
                            childrenLength - 1,
                            structureCurrentId + 1,
                        );
                        break;
                    }

                    case Key.BACKSPACE: {
                        if (currentStructure.type === "TRASH") {
                            if (structureCurrentId === 0 || !structureCurrentId)
                                break;

                            modalItemIndex = structureCurrentId - 1;
                            modalOpen = true;
                            modalSelected = 1;

                            manager.objects = [
                                ...components.container,
                                ...components.tutorial,
                                ...createStructureItems(),
                                ...createModalComponents(),
                            ];
                            break;
                        }

                        if (!structureCurrentId) break;

                        const selected = children[structureCurrentId];
                        if (
                            selected.type === "PARENT" ||
                            selected.type === "TRASH"
                        )
                            break;

                        const actualIndex = structureCurrentId - 1;
                        if (actualIndex < 0 || !currentStructure.children)
                            break;

                        const removed = currentStructure.children.splice(
                            actualIndex,
                            1,
                        )[0];
                        if (removed) {
                            trashFolder.children = trashFolder.children || [];
                            trashFolder.children.push(removed);
                        }

                        structureCurrentId = 0;
                        break;
                    }

                    case Key.ENTER: {
                        if (structureCurrentId === null) break;

                        const selected = children[structureCurrentId];

                        if (selected) {
                            if (selected.type === "PARENT") {
                                currentStructure =
                                    structureStack.pop() || currentStructure;
                            } else if (selected.type === "TRASH") {
                                structureStack.push(currentStructure);
                                currentStructure = trashFolder;
                            } else if (
                                selected.type === "DIRECTORY" &&
                                selected.children
                            ) {
                                structureStack.push(currentStructure);
                                currentStructure = selected;
                            }
                        }

                        structureCurrentId = 0;
                        break;
                    }
                }

                manager.objects = [
                    ...components.container,
                    ...components.tutorial,
                    ...createStructureItems(),
                ];
            },
        },
    },
});

manager.cursor.hide();
setInterval(() => manager.flip(), 1000 / 30);
