import {Action} from "./Action";

/**
 * Manages undo/redo actions
 */
export class ActionManager {
    undoStack: Array<Action>;
    redoStack: Array<Action>;

    public constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Add a new action to the undo stack
     * @param action The new action
     */
    public add(action: Action): void {
        action.execute();
        this.redoStack = [];
        this.undoStack.push(action);
    }

    /**
     * Undo next action and add to redo stack
     */
    public undo(): void {
        if (this.undoStack.length > 0) {
            // pop next action and undo it
            var action = this.undoStack.pop();
            action.undo();

            // add to redo stack
            this.redoStack.push(action);
        }
    }

    /**
     * Redo next action and add back to undo stack
     */
    public redo(): void {
        if (this.redoStack.length > 0) {
            // pop next action and redo it
            var action = this.redoStack.pop();
            action.execute();

            // add back to undo stack
            this.undoStack.push(action);
        }
    }

}
