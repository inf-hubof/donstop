import { FlowType, DirectoryStructure, Ram, Flow } from "./types";

export const RAM: Ram = {
    currentFlow: FlowType.DESKTOP,
    structure: {
        type: "DIRECTORY",
        name: "(root)",
        children: [
            {
                type: "DIRECTORY",
                name: "important",
                children: [{ type: "FILE", name: "module.h" }],
            },
            { type: "FILE", name: "me.obj" },
            { type: "FILE", name: "todo.txt" },
            { type: "FILE", name: "README.md" },
        ],
    },
};

export const directoryStack: DirectoryStructure[] = [];

export const flow: { [key in FlowType]: Flow } = {
    [FlowType.DESKTOP]: { selectedId: null, objects: [] },
    [FlowType.FOLDER]: { selectedId: null, objects: [] },
    [FlowType.FILE]: { selectedId: null, objects: [] },
    [FlowType.TRASH]: { selectedId: null, objects: [] },
};
