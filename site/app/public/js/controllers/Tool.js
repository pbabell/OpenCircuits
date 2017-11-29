class Tool {
    constructor() {
        this.isActive = false;
    }
    activate() {
        CurrentTool.deactivate();

        CurrentTool = this;
        this.isActive = true;
        render();
    }
    deactivate() {
        this.isActive = false;
    }
    onKeyDown(code) {
    }
    onKeyUp(code) {
    }
    onMouseDown() {
    }
    onMouseMove() {
    }
    onMouseUp() {
    }
    onClick() {
    }
    draw() {
    }
}
var CurrentTool;