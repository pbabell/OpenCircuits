import {IO_PORT_LENGTH, LEFT_MOUSE_BUTTON} from "core/utils/Constants";
import {V} from "Vector";
import {GetNearestPointOnRect} from "math/MathUtils";

import {PortContains} from "core/utils/ComponentUtils";
import {Event} from "core/utils/Events";

import {Port} from "core/models";

import {ICCircuitInfo} from "digital/utils/ICCircuitInfo";


export const ICPortTool = (() => {
    let port: Port;

    function findPort({input, camera, ic}: Partial<ICCircuitInfo>): Port {
        const worldMousePos = camera.getWorldPos(input.getMousePos());
        return ic.getPorts().find(p => PortContains(p, worldMousePos));
    }

    return {
        shouldActivate(event: Event, info: ICCircuitInfo): boolean {
            // Activate if the user began dragging over an edge
            return (event.type === "mousedrag" &&
                    event.button === LEFT_MOUSE_BUTTON &&
                    info.input.getTouchCount() === 1 &&
                    findPort(info) !== undefined);
        },
        shouldDeactivate(event: Event, _: ICCircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },


        onActivate(_: Event, info: ICCircuitInfo): void {
            const icPort = findPort(info);
            port = info.ic.getData().getPorts()[info.ic.getPorts().indexOf(icPort)];
        },
        onDeactivate(_: Event, __: ICCircuitInfo): void {
            port = undefined;
        },


        onEvent(event: Event, {input, camera, ic}: ICCircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const worldMousePos = camera.getWorldPos(input.getMousePos());

            const size = ic.getSize();
            const p = GetNearestPointOnRect(size.scale(-0.5), size.scale(0.5), worldMousePos);

            // Set v to point away from the IC depending on the mouse position
            let v = p.sub(worldMousePos);
            if (ic.isWithinSelectBounds(worldMousePos)) {
                // TODO: turn switches into little switch icons
                //  on the surface of the IC and same with LEDs
                v = worldMousePos.sub(p);
            } else if (worldMousePos.x == p.x && worldMousePos.y == p.y) {
                // Set v outwards from the edge the origin position is on
                if (Math.abs(p.x)-size.x/2 < Math.abs(p.y)-size.y/2)
                    v = V(0,-1).scale(p.y);
                else
                    v = V(-1,0).scale(p.x);
            }

            // Set the direction vector to the length of a port
            v = v.normalize().scale(-IO_PORT_LENGTH).add(p);

            // Set port for IC
            port.setOriginPos(p);
            port.setTargetPos(v);

            // Set pos for ICData
            ic.update();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },


        findPort: findPort,
        isDragging(): boolean {
            return (port !== undefined);
        }
    }
})();
