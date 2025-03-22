import { Components } from "../models/types";
import { flow } from "../models/state";

import { updateSelection, handleEnterSelection } from "../flows/flow-manager";
import { CanvasManager, Key } from "../../classes/CanvasManager";

export function initializeManager(components: Components): CanvasManager {
    const manager = new CanvasManager({
        init: {
            objects: flow[components.RAM.currentFlow].objects,
            listener: {
                keydown(input: string) {
                    if (input === Key.EXIT) {
                        manager.cursor.show();
                        process.exit();
                    }

                    switch (input) {
                        case Key.ARROW_LEFT: {
                            flow[components.RAM.currentFlow].selectedId =
                                flow[components.RAM.currentFlow].selectedId ===
                                null
                                    ? 0
                                    : Math.max(
                                          0,
                                          (flow[components.RAM.currentFlow]
                                              .selectedId || 0) - 1,
                                      );
                            updateSelection(components);
                            break;
                        }

                        case Key.ARROW_RIGHT: {
                            const itemCount =
                                (components.directoryStack.length > 0 ? 1 : 0) +
                                (components.RAM.structure.children
                                    ? components.RAM.structure.children.length
                                    : 0);
                            flow[components.RAM.currentFlow].selectedId =
                                flow[components.RAM.currentFlow].selectedId ===
                                null
                                    ? 0
                                    : Math.min(
                                          itemCount - 1,
                                          (flow[components.RAM.currentFlow]
                                              .selectedId || 0) + 1,
                                      );
                            updateSelection(components);
                            break;
                        }

                        case Key.ENTER: {
                            handleEnterSelection(components, manager);
                            break;
                        }

                        default:
                            break;
                    }
                },
            },
        },
    });

    manager.cursor.hide();
    return manager;
}
