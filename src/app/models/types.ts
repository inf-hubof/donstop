import type { TObj } from "../../ui/types/object";

export enum FlowType {
    DESKTOP = "DESKTOP",
    FOLDER = "FOLDER",
    FILE = "FILE",
    TRASH = "TRASH",
}

export interface DirectoryStructure {
    type: "DIRECTORY" | "FILE";
    name: string;
    children?: DirectoryStructure[];
}

export interface Ram {
    currentFlow: FlowType;
    structure: DirectoryStructure;
}

export interface Flow {
    selectedId: number | null;
    objects: TObj[];
}

export interface Components {
    CONTAINER: TObj;
    STATUS_BAR: TObj[];
    ITEMS: TObj[];
    RAM: Ram;
    directoryStack: DirectoryStructure[];
}
