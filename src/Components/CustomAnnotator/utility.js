import React from "react";
import IntervalTree from "@flatten-js/interval-tree";

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

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

// this needs to be modified for overlapping - createIntervals function
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

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////

export const createIntervals = (text, annotations) => {
  let breakPoints = new Set();
  for (let annotation of annotations) {
    breakPoints.add(annotation.start);
    breakPoints.add(annotation.end);
    breakPoints.add(0);
    breakPoints.add(text.length - 1);
  }

  breakPoints = Array.from(breakPoints).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  let intervals = [];

  for (let i = 0; i < breakPoints.length - 1; i++) {
    intervals.push({
      start: breakPoints[i],
      end: breakPoints[i + 1],
      content: text.slice(breakPoints[i], breakPoints[i + 1])
    });
  }

  intervals = colorAnnotations(intervals, annotations);

  return intervals;
};

// maybe call this something else - see where it goes
const colorAnnotations = (intervals, annotations) => {
  let tree = new IntervalTree(); // tree library uses inclusive end points

  for (let i = 0; i < annotations.length; i++) {
    console.log("annotations", i, annotations[i]);
    tree.insert([annotations[i].start, annotations[i].end - 1], i + 1); // i + 1 --- tree library won't let you use 0 as a key
  }

  for (let interval of intervals) {
    interval.annotes = tree.search([interval.start, interval.end - 1]);
    interval.numAnnotes = interval.annotes.length;
    console.log("interval", interval);
  }

  // tasks to do
  // -------------------

  // get number of annotations per interval

  // determine height percent for each color based upon the max number of
  // annotations per interval for all of the annotations in that specific interval

  // align colouring and map to labels

  // set mark to true and pass colours to css gradient

  return intervals; // change later
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
