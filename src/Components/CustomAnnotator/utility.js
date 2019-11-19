import React from "react";

export const Split = props => {
  if (props.mark) {
    return <Mark {...props} />;
  }

  return (
    <span
      data-start={props.start}
      data-end={props.end}
      onClick={() => props.onClick({ start: props.start, end: props.end })}
    >
      {props.content}
    </span>
  );
};

export const Mark = props => {
  return (
    <mark
      style={{ backgroundColor: props.color || "#84d2ff", padding: "0 4px" }}
      data-start={props.start}
      data-end={props.end}
      onClick={() => props.onClick({ start: props.start, end: props.end })}
    >
      {props.content}
      {props.tag && <span style={{ fontSize: "0.7em", fontWeight: 500, marginLeft: 6 }}>{props.tag}</span>}
    </mark>
  );
};

// checks if selection is empty
export const selectionIsEmpty = selection => {
  let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
  return position === 0 && selection.focusOffset === selection.anchorOffset;
};

// this needs to be modified for overlapping - interal tree instead?
export const splitWithOffsets = (text, offsets) => {
  let lastEnd = 0;
  const splits = [];

  offsets = offsets.sort((a, b) => {
    return a.start - b.start;
  });

  for (let i = 0; i < offsets.length; i++) {
    if (lastEnd < offsets[i].start) {
      splits.push({
        start: lastEnd,
        end: offsets[i].start,
        content: text.slice(lastEnd, offsets[i].start)
      });
    }
    splits.push({
      ...offsets[i],
      mark: true,
      content: text.slice(offsets[i].start, offsets[i].end)
    });
    lastEnd = offsets[i].end;
  }
  if (lastEnd < text.length) {
    splits.push({
      start: lastEnd,
      end: text.length,
      content: text.slice(lastEnd, text.length)
    });
  }

  return splits;
};

export const selectionIsBackwards = selection => {
  if (selectionIsEmpty(selection)) {
    return false;
  }
  let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);

  let backward = false;
  if ((!position && selection.anchorOffset > selection.focusOffset) || position === Node.DOCUMENT_POSITION_PRECEDING) {
    backward = true;
  }

  return backward;
};
