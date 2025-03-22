import { FlowType, DirectoryStructure, Components } from "../models/types";
import { RAM, directoryStack, flow } from "../models/state";

import { CanvasManager } from "../../classes/CanvasManager";

import { createItems } from "../components/ui-components";
import { TBox, TLabel } from "../../ui";

export function updateUI(components: Components, manager: CanvasManager): void {
    (components.STATUS_BAR[1] as TLabel).text = `  ${RAM.currentFlow}  `;
    components.ITEMS = createItems(RAM, directoryStack);
    flow[RAM.currentFlow].objects = [
        components.CONTAINER,
        ...components.STATUS_BAR,
        ...components.ITEMS,
    ];
    manager.objects = flow[RAM.currentFlow].objects;
    flow[RAM.currentFlow].selectedId = null;
    updateSelection(components);
}

export function updateSelection(components: Components): void {
    const selectedIndex = flow[RAM.currentFlow].selectedId;
    const itemCount =
        (directoryStack.length > 0 ? 1 : 0) +
        (RAM.structure.children ? RAM.structure.children.length : 0);

    for (let i = 0; i < itemCount; i++) {
        const box = components.ITEMS[i * 3] as TBox;
        box.style.border =
            i === selectedIndex ? { type: "solid", color: "blue" } : undefined;
    }
}

export function handleEnterSelection(
    components: Components,
    manager: CanvasManager,
): void {
    const idx = flow[RAM.currentFlow].selectedId;
    if (idx === null) return;

    if (directoryStack.length > 0 && idx === 0) {
        const parent: DirectoryStructure | undefined = directoryStack.pop();
        if (parent) {
            RAM.structure = parent;
            RAM.currentFlow =
                parent.name === "(root)" ? FlowType.DESKTOP : FlowType.FOLDER;
            updateUI(components, manager);
        }
    } else {
        const adjustedIndex = directoryStack.length > 0 ? idx - 1 : idx;
        const children = RAM.structure.children;
        if (children && adjustedIndex >= 0 && adjustedIndex < children.length) {
            const selectedItem = children[adjustedIndex];
            if (selectedItem.type === "DIRECTORY" && selectedItem.children) {
                directoryStack.push(RAM.structure);
                RAM.structure = selectedItem;
                RAM.currentFlow = FlowType.FOLDER;
                updateUI(components, manager);
            } else {
                // 파일 선택 시 처리 로직 추가
            }
        }
    }
}
