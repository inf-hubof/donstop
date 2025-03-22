import {
    BASE_START_X,
    ITEM_WIDTH,
    ITEM_HEIGHT,
    ITEM_GAP,
} from "../config/constants";

import { TBox, TLabel, TIcon } from "../../ui/index";

import type { DirectoryStructure, Ram } from "../models/types";
import type { TObj } from "../../ui/types/object";

export function createNavigationItem(): TObj[] {
    const baseX = BASE_START_X;

    const box = new TBox({
        position: { x: baseX, y: 5 },
        size: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
        style: { border: { type: "solid", color: "gray" } },
    });
    const icon = new TIcon({
        varient: "DIRECTORY",
        position: { x: baseX, y: 5 },
        size: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
    });
    const label = new TLabel({
        position: { x: baseX, y: 5 + ITEM_HEIGHT },
        size: { width: ITEM_WIDTH, height: 1 },
        text: "..",
    });

    return [box, icon, label];
}

export function createItemComponents(
    item: DirectoryStructure,
    baseX: number,
): TObj[] {
    const box = new TBox({
        position: { x: baseX, y: 5 },
        size: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
    });
    const icon = new TIcon({
        varient: item.type,
        position: { x: baseX, y: 5 },
        size: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
    });
    const label = new TLabel({
        position: { x: baseX, y: 5 + ITEM_HEIGHT },
        size: { width: ITEM_WIDTH, height: 1 },
        text: item.name.slice(0, ITEM_WIDTH),
    });

    return [box, icon, label];
}

export function createItems(
    RAM: Ram,
    directoryStack: DirectoryStructure[],
): TObj[] {
    const items: TObj[] = [];
    let offset = 0;

    if (directoryStack.length > 0) {
        items.push(...createNavigationItem());
        offset++;
    }

    if (RAM.structure.children) {
        RAM.structure.children.forEach(
            (item: DirectoryStructure, index: number) => {
                const baseX = BASE_START_X + (offset + index) * ITEM_GAP;
                items.push(...createItemComponents(item, baseX));
            },
        );
    }

    return items;
}
