import { CanvasManager, Key } from "../classes/CanvasManager";
import { TBox, TIcon, TLabel } from "../ui";

import type { TObj } from "../ui/types/object";

const SCREEN_WIDTH = process.stdout.columns;
const SCREEN_HEIGHT = process.stdout.rows;

interface FileEntry {
    type: "DIRECTORY" | "FILE" | "PARENT" | "TRASH" | "HACK";
    name: string;
    children?: FileEntry[];
}

const rootStructure: FileEntry = {
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

let currentStructure: FileEntry = rootStructure;
const structureStack: FileEntry[] = [];
let currentSelectedIndex: number = 0;

let modalOpen = false;
let modalSelectedOption = 1;
let modalItemIndex: number | null = null;

let currentFlow: "DESKTOP" | "TRASH" | "HACK" | "IN_DIRECTORY" = "DESKTOP";

function getCurrentEntries(): FileEntry[] {
    let entries = currentStructure.children
        ? [...currentStructure.children]
        : [];

    if (structureStack.length > 0)
        entries = [{ type: "PARENT", name: ".." }, ...entries];

    if (structureStack.length === 0 && currentStructure.type !== "TRASH")
        entries = [
            { type: "TRASH", name: "(trash)" },
            { type: "HACK", name: "(hack)" },
            ...entries,
        ];

    return entries;
}

function createStructureComponents(): TObj[] {
    const entries = getCurrentEntries();

    return entries.flatMap((entry, idx) => {
        const baseX = 5 + idx * 14;

        return [
            new TBox({
                position: { x: baseX, y: 4 },
                size: { width: 12, height: 6 },
                style:
                    currentSelectedIndex === idx
                        ? { border: { type: "solid", color: "cyan" } }
                        : undefined,
            }),
            new TIcon({
                varient: entry.type === "PARENT" ? "DIRECTORY" : entry.type,
                position: { x: baseX, y: 4 },
                size: { width: 12, height: 6 },
            }),
            new TLabel({
                position: { x: baseX, y: 10 },
                size: { width: 12, height: 1 },
                text: entry.name,
            }),
        ];
    });
}

function createModalComponents(): TObj[] {
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
            text: modalSelectedOption === 0 ? "[no]" : "no",
        }),
        new TLabel({
            position: { x: modalX + 20, y: modalY + 4 },
            size: { width: 5, height: 1 },
            text: modalSelectedOption === 1 ? "[yes]" : "yes",
        }),
    ];
}

function createContainerComponents(): TObj[] {
    return [
        new TBox({
            position: { x: 1, y: 1 },
            size: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
            style: { border: { type: "solid", color: "gray" } },
        }),
        new TLabel({
            position: { x: 5, y: 2 },
            size: { width: currentFlow.toLowerCase().length, height: 1 },
            style: { color: "cyan" },
            text: currentFlow.toLowerCase(),
        }),
    ];
}

const tutorialComponents: TObj[] = [
    new TBox({
        position: { x: Math.floor(SCREEN_WIDTH / 4) * 3 - 1, y: 2 },
        size: { width: Math.ceil(SCREEN_WIDTH / 4), height: SCREEN_HEIGHT - 2 },
        style: { border: { type: "double", color: "gray" } },
    }),
    ...["move: ← →", "click: enter ↵", "remove: backspace ↤"].map(
        (item, idx) =>
            new TLabel({
                position: {
                    x: Math.floor(SCREEN_WIDTH / 4) * 3 + 3,
                    y: 4 + idx * 2,
                },
                size: { width: item.length, height: 1 },
                text: item,
            }),
    ),
];

function updateUIObjects() {
    const baseComponents = [
        ...createContainerComponents(),
        ...tutorialComponents,
        ...createStructureComponents(),
    ];

    manager.objects = modalOpen
        ? [...baseComponents, ...createModalComponents()]
        : baseComponents;
}

function handleModalKey(input: string) {
    switch (input) {
        case Key.ARROW_LEFT:
            modalSelectedOption = Math.max(0, modalSelectedOption - 1);
            break;

        case Key.ARROW_RIGHT:
            modalSelectedOption = Math.min(1, modalSelectedOption + 1);
            break;

        case Key.ENTER:
            if (modalSelectedOption === 1 && modalItemIndex !== null)
                trashFolder.children?.splice(modalItemIndex, 1);

            modalOpen = false;
            modalItemIndex = null;
            break;

        case Key.ESC:
            modalOpen = false;
            modalItemIndex = null;
            break;
    }

    updateUIObjects();
}

function handleNavigationKey(input: string) {
    const entries = getCurrentEntries();
    const totalEntries = entries.length;

    if (input === Key.EXIT) {
        manager.cursor.show();
        process.exit();
    }

    switch (input) {
        case Key.ARROW_LEFT:
            currentSelectedIndex = Math.max(0, currentSelectedIndex - 1);
            break;

        case Key.ARROW_RIGHT:
            currentSelectedIndex = Math.min(
                totalEntries - 1,
                currentSelectedIndex + 1,
            );
            break;

        case Key.BACKSPACE: {
            if (
                ["TRASH", "HACK", "PARENT"].includes(
                    entries[currentSelectedIndex].type,
                )
            )
                break;

            if (currentStructure.type === "TRASH") {
                modalItemIndex = currentSelectedIndex - 1;
                modalOpen = true;
                modalSelectedOption = 1;

                updateUIObjects();
                return;
            }

            const actualIndex = currentSelectedIndex - 2;
            if (!currentStructure.children || actualIndex < 0) break;

            const removedItem = currentStructure.children.splice(
                actualIndex,
                1,
            )[0];
            if (removedItem) {
                trashFolder.children = trashFolder.children || [];
                trashFolder.children.push(removedItem);
            }

            currentSelectedIndex = 0;
            break;
        }

        case Key.ENTER: {
            const selected = entries[currentSelectedIndex];
            if (!selected) break;

            if (selected.type === "PARENT") {
                currentFlow = "DESKTOP";
                currentStructure = structureStack.pop() || currentStructure;
            } else if (selected.type === "TRASH") {
                currentFlow = "TRASH";
                structureStack.push(currentStructure);
                currentStructure = trashFolder;
            } else if (selected.type === "HACK") {
                currentFlow = "HACK";
                manager.objects = [...createContainerComponents()];
            } else if (selected.type === "DIRECTORY" && selected.children) {
                currentFlow = "IN_DIRECTORY";
                structureStack.push(currentStructure);
                currentStructure = selected;
            }

            currentSelectedIndex = 0;
            break;
        }
    }

    updateUIObjects();
}

const manager = new CanvasManager({
    init: {
        objects: [
            ...createContainerComponents(),
            ...tutorialComponents,
            ...createStructureComponents(),
        ],
        listener: {
            keydown(input) {
                if (modalOpen) {
                    handleModalKey(input);
                    return;
                }

                handleNavigationKey(input);
            },
        },
    },
});

manager.cursor.hide();
setInterval(() => manager.flip(), 1000 / 30);
