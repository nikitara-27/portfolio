// Shared feature-detection query for "real" hover + precise pointer (mouse/
// trackpad) — as opposed to touch, where hover doesn't exist and pointer is
// coarse. Used via matchMedia() in DraggableSticker.jsx and WorkCard.jsx to
// split behavior by input type; kept as one literal so JS and any mirrored
// CSS media query always agree on which devices count as "hover-capable."
export const HOVER_CAPABLE_QUERY = '(hover: hover) and (pointer: fine)'
