import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./config/constants";

import { RAM, directoryStack, flow } from "./models/state";
import type { Components } from "./models/types";

import { createItems } from "./components/ui-components";
import { TBox, TLabel } from "../ui";

import { CanvasManager } from "../classes/CanvasManager";
import { initializeManager } from "./managers/manager";

const statusBarContainer = new TBox({
    position: { x: 2, y: 2 },
    size: { width: SCREEN_WIDTH - 6, height: 2 },
    style: {
        border: {
            position: { top: false, bottom: true, left: false, right: false },
            type: "solid",
            color: "gray",
        },
    },
});

const currentFlowLabel = new TLabel({
    position: { x: 6, y: 2 },
    size: { width: RAM.currentFlow.length + 2, height: 1 },
    style: {
        background: { color: "gray" },
        padding: { left: 1, right: 1 },
    },
    text: `  ${RAM.currentFlow}  `,
});

const components: Components = {
    CONTAINER: new TBox({
        position: { x: 1, y: 1 },
        size: { width: SCREEN_WIDTH - 2, height: SCREEN_HEIGHT - 2 },
        style: { border: { type: "solid", color: "gray" } },
    }),
    STATUS_BAR: [statusBarContainer, currentFlowLabel],
    ITEMS: createItems(RAM, directoryStack),
    RAM,
    directoryStack,
};

flow[RAM.currentFlow].objects = [
    components.CONTAINER,
    ...components.STATUS_BAR,
    ...components.ITEMS,
];

const manager: CanvasManager = initializeManager(components);

setInterval(() => {
    manager.flip();
}, 1000 / 30);
