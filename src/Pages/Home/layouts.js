const defaultLayoutLg = [
  { w: 18, h: 33, x: 0, y: 4, i: "tree" },
  { w: 16, h: 19, x: 18, y: 0, i: "selectedCodes" },
  { w: 14, h: 37, x: 34, y: 0, i: "recommendedCodes" },
  { w: 16, h: 18, x: 18, y: 16, i: "daggerCodes" },
  { w: 18, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutMd = [
  { w: 21, h: 21, x: 0, y: 20, i: "tree" },
  { w: 21, h: 16, x: 0, y: 4, i: "selectedCodes" },
  { w: 19, h: 26, x: 21, y: 15, i: "recommendedCodes" },
  { w: 19, h: 15, x: 21, y: 0, i: "daggerCodes" },
  { w: 21, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutSm = [
  { w: 24, h: 32, x: 0, y: 32, i: "tree" },
  { w: 14, h: 14, x: 0, y: 4, i: "selectedCodes" },
  { w: 10, h: 32, x: 14, y: 0, i: "recommendedCodes" },
  { w: 14, h: 14, x: 0, y: 18, i: "daggerCodes" },
  { w: 14, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutXs = [
  { w: 16, h: 31, x: 0, y: 63, i: "tree" },
  { w: 16, h: 15, x: 0, y: 4, i: "selectedCodes" },
  { w: 16, h: 27, x: 0, y: 36, i: "recommendedCodes" },
  { w: 16, h: 17, x: 0, y: 39, i: "daggerCodes" },
  { w: 16, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutXxs = [
  { w: 8, h: 31, x: 0, y: 55, i: "tree" },
  { w: 8, h: 15, x: 0, y: 4, i: "selectedCodes" },
  { w: 8, h: 19, x: 0, y: 36, i: "recommendedCodes" },
  { w: 8, h: 17, x: 0, y: 19, i: "daggerCodes" },
  { w: 2, h: 4, x: 0, y: 0, i: "inputBoxes" }
];

export const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};
