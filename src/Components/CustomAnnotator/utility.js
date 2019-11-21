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

// this needs to be modified for overlapping - interval tree instead?
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

// export const createIntervals = (text, annotations) => {
//   const intervals = [];
//   let lastEnd = 0;

//   annotations = annotations.sort((a, b) => {
//     return a.start - b.start;
//   });

//   // deep copy of annotations - can change to another method of copying later
//   annotations = JSON.parse(JSON.stringify(annotations));

//   // something for start? - can maybe do at end -
//   // check if first interval starts at 0
//   for (let i = 0; i < annotations.length - 1; i++) {
//     if (annotations[i].end > lastEnd) {
//       let j = i + 1;
//       // iterate through all annotations where the start is before the current (i) interval
//       while (annotations[j].start < annotations[i].end) {
//         j += 1;
//       }
//     }
//   }
//   // something with last annotation (went to length - 1 due to using +1)
//   // something for end of text

//   console.log("in create intervals", annotations);
//   return intervals;
// };

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

  intervals = colorAnnotations(intervals);

  return intervals;
};

const colorAnnotations = intervals => {
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
