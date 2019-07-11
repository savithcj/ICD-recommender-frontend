const defaultLayoutLg = [
  { w: 7, h: 16, x: 0, y: 0, i: "chord" },
  { w: 5, h: 16, x: 7, y: 0, i: "sankey" },
  { w: 7, h: 13, x: 0, y: 16, i: "rules" },
  { w: 5, h: 13, x: 7, y: 16, i: "dad" }
];
const defaultLayoutMd = [
  { w: 5, h: 15, x: 0, y: 0, i: "chord" },
  { w: 5, h: 15, x: 5, y: 0, i: "sankey" },
  { w: 5, h: 17, x: 0, y: 15, i: "rules" },
  { w: 5, h: 17, x: 5, y: 15, i: "dad" }
];
const defaultLayoutSm = [
  { w: 6, h: 14, x: 0, y: 0, i: "chord" },
  { w: 6, h: 16, x: 0, y: 14, i: "sankey" },
  { w: 6, h: 13, x: 0, y: 30, i: "rules" },
  { w: 6, h: 18, x: 0, y: 43, i: "dad" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 0, i: "chord" },
  { w: 4, h: 15, x: 0, y: 14, i: "sankey" },
  { w: 4, h: 8, x: 0, y: 29, i: "rules" },
  { w: 4, h: 14, x: 0, y: 37, i: "dad" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 0, i: "chord" },
  { w: 2, h: 9, x: 0, y: 12, i: "sankey" },
  { w: 2, h: 12, x: 0, y: 21, i: "rules" },
  { w: 2, h: 13, x: 0, y: 33, i: "dad" }
];

export const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};
