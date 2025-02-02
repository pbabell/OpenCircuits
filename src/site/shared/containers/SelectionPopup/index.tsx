import React, {useEffect, useLayoutEffect, useRef, useState} from "react";

import {DOUBLE_CLICK_DURATION, HEADER_HEIGHT} from "shared/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {useEvent} from "shared/utils/hooks/useEvent";

import {TitleModule} from "./modules/TitleModule";
import {UseModuleProps} from "./modules/Module";

import "./index.scss";
import {Clamp} from "math/MathUtils";
import {ITEMNAV_WIDTH} from "core/utils/Constants";


type Props = {
    info: CircuitInfo;
    modules: ((props: UseModuleProps) => JSX.Element)[];
}
export function SelectionPopup({info, modules}: Props) {
    const calcPos = () => camera.getScreenPos(selections.midpoint(true));

    const {input, camera, history, selections, renderer} = info;


    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const update = () => setIsVisible(selections.amount() > 0);

        selections.addChangeListener(update);
        return () => selections.removeChangeListener(update);
    }, [selections, setIsVisible]);


    const [pos, setPos] = useState({x: 0, y: 0});
    useEffect(() => {
        const update = () => setPos(calcPos());

        // Subscribe to history for translation/selection changes
        history.addCallback(update);
        return () => history.removeCallback(update);
    }, [history, setPos]);
    useEvent("zoom", (_) => {
        setPos(calcPos()); // Recalculate position on zoom
    }, input, [camera, selections, setPos]);


    const [isDragging, setIsDragging] = useState(false);
    useEvent("mousedrag", (_) => {
        setIsDragging(true); // Don't show popup if dragging
    }, input, [setIsDragging]);
    useEvent("mouseup", (_) => {
        setIsDragging(false); // Show when stopped dragging
        setPos(calcPos()); // And recalculate position
    }, input, [selections, setIsDragging]);


    const [clickThrough, setClickThrough] = useState(false);
    useEvent("click", (_) => {
        // Let user click through box so it doesn't block a double click
        setClickThrough((prevState) => {
            if (prevState) // If already have a timeout then just ignore
                return prevState;
            setTimeout(() =>
                setClickThrough(false),
                DOUBLE_CLICK_DURATION
            );
            return true;
        });
    }, input, [setClickThrough]);


    const popup = useRef<HTMLDivElement>();

    // Clamp position to screen if visible
    if (isVisible && !isDragging) {
        const popupWidth = popup.current.getBoundingClientRect().width;
        const popupHeight = popup.current.getBoundingClientRect().height;

        pos.x = Clamp(pos.x, 0, window.innerWidth - popupWidth);

        // Since the Selection Popup has a transform (0, -50%), this `y` position is the
        //  y position of the middle of it, not the top
        pos.y = Clamp(pos.y, popupHeight/2, window.innerHeight - HEADER_HEIGHT - popupHeight/2);
    }

    return (
        <div ref={popup}
             className="selection-popup"
             style={{
                left: `${pos.x}px`,
                top:  `${pos.y}px`,
                visibility: (isVisible && !isDragging ? "visible": "hidden"),
                pointerEvents: (clickThrough ? "none" : "auto")
             }}
             tabIndex={-1}>
            <TitleModule selections={selections}
                         addAction={(a) => history.add(a)}
                         render={() => renderer.render()}  />
            <hr />
            {modules.map((m, i) => React.createElement(m, {
                key: `selection-popup-module-${i}`,
                selections,
                addAction: (a) => history.add(a),
                render: () => renderer.render(),
            }))}
        </div>
    );
}
