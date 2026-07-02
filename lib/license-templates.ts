export type TemplateKey = "print" | "template4" | "photo" | "template3";

export type Point = {
  x: number;
  y: number;
};

export type OptionalPoint = {
  x?: number;
  y?: number;
};

export type StampDebugConfig = {
  x: number;
  y: number;
  size: number;
  starSize: number;
  orgSize: number;
  orgHeight: number;
  orgStretch: number;
  orgDistribution: number;
  codeDistribution: number;
  enablePostBold: boolean;
  postBoldStrength: number;
  enableBoldNoise: boolean;
  boldNoiseStrength: number;
};

export type TextStyleConfig = {
  fontFamily: string;
  titleFontSize: number;
  fontSize: number;
  codeFontSize: number;
  scopeFontSize: number;
  scopeLineHeight: number;
  scopeMaxWidth: number;
  lineHeight: number;
  isBold: boolean;
};

export type LicenseTemplate = {
  bgSrc: string;
  textColor: string;
  qrColor: string;
  pos: {
    code: Point;
    name: Point;
    type: Point;
    rep: Point;
    capital: Point;
    date_found: Point;
    term: OptionalPoint;
    address: Point;
    scope: Point;
    year: Point;
    month: Point;
    day: Point;
  };
  qrPos: {
    x: number;
    y: number;
    size: number;
  };
  stampDebug: StampDebugConfig;
  style: TextStyleConfig;
};

export type TemplatesConfig = Record<TemplateKey, LicenseTemplate>;

export type LicenseFormState = {
  code: string;
  name: string;
  type: string;
  rep: string;
  capital: string;
  date_found: string;
  date_register: string;
  term: string;
  address: string;
  scope: string;
  stamp_org: string;
  stamp_code: string;
};

export const TEMPLATE_OPTIONS: Array<{ key: TemplateKey; label: string }> = [
  { key: "print", label: "打印版 1" },
  { key: "template4", label: "打印版 2" },
  { key: "photo", label: "拍照版 1" },
  { key: "template3", label: "拍照版 2" },
];

export const DEFAULT_FORM: LicenseFormState = {
  code: "",
  name: "",
  type: "",
  rep: "",
  capital: "",
  date_found: "",
  date_register: "",
  term: "",
  address: "",
  scope: "",
  stamp_org: "",
  stamp_code: "",
};

const SONG_FONT_STACK =
  '"Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif';

export const DEFAULT_TEMPLATES: TemplatesConfig = {
  print: {
    bgSrc: "/bg.jpg",
    textColor: "#000000",
    qrColor: "#000000",
    pos: {
      code: { x: 320, y: 680 },
      name: { x: 650, y: 1030 },
      type: { x: 650, y: 1160 },
      rep: { x: 650, y: 1285 },
      capital: { x: 2250, y: 1035 },
      date_found: { x: 2250, y: 1165 },
      term: { x: 2250, y: 1295 },
      address: { x: 2250, y: 1425 },
      scope: { x: 650, y: 1415 },
      year: { x: 2510, y: 2035 },
      month: { x: 2740, y: 2035 },
      day: { x: 2920, y: 2035 },
    },
    qrPos: { x: 2501, y: 608, size: 245 },
    stampDebug: {
      x: 2690,
      y: 1880,
      size: 401,
      starSize: 0.3,
      orgSize: 0.1666,
      orgHeight: 1.0,
      orgStretch: 0.6,
      orgDistribution: 0.9,
      codeDistribution: 1.4,
      enablePostBold: true,
      postBoldStrength: 1,
      enableBoldNoise: true,
      boldNoiseStrength: 80,
    },
    style: {
      fontFamily: SONG_FONT_STACK,
      titleFontSize: 50,
      fontSize: 50,
      codeFontSize: 49,
      scopeFontSize: 50,
      scopeLineHeight: 60,
      scopeMaxWidth: 1200,
      lineHeight: 60,
      isBold: false,
    },
  },
  photo: {
    bgSrc: "/bg2.png",
    textColor: "rgb(71, 70, 67)",
    qrColor: "#474643",
    pos: {
      code: { x: 650, y: 890 },
      name: { x: 990, y: 1275 },
      type: { x: 990, y: 1410 },
      rep: { x: 990, y: 1545 },
      capital: { x: 2660, y: 1295 },
      date_found: { x: 2660, y: 1425 },
      term: {},
      address: { x: 2660, y: 1560 },
      scope: { x: 990, y: 1690 },
      year: { x: 2960, y: 2355 },
      month: { x: 3185, y: 2355 },
      day: { x: 3340, y: 2355 },
    },
    qrPos: { x: 2934, y: 854, size: 257 },
    stampDebug: {
      x: 3200,
      y: 2200,
      size: 401,
      starSize: 0.3,
      orgSize: 0.1666,
      orgHeight: 1.0,
      orgStretch: 0.6,
      orgDistribution: 0.9,
      codeDistribution: 1.4,
      enablePostBold: false,
      postBoldStrength: 2,
      enableBoldNoise: false,
      boldNoiseStrength: 50,
    },
    style: {
      fontFamily: SONG_FONT_STACK,
      titleFontSize: 50,
      fontSize: 50,
      codeFontSize: 49,
      scopeFontSize: 50,
      scopeLineHeight: 60,
      scopeMaxWidth: 1200,
      lineHeight: 60,
      isBold: false,
    },
  },
  template3: {
    bgSrc: "/bg3.jpg",
    textColor: "rgb(71, 70, 67)",
    qrColor: "#474643",
    pos: {
      code: { x: 554, y: 674 },
      name: { x: 850, y: 1012 },
      type: { x: 850, y: 1134 },
      rep: { x: 850, y: 1265 },
      capital: { x: 2435, y: 1016 },
      date_found: { x: 2435, y: 1134 },
      term: { x: 0, y: 0 },
      address: { x: 2435, y: 1263 },
      scope: { x: 850, y: 1390 },
      year: { x: 2700, y: 2007 },
      month: { x: 2900, y: 2007 },
      day: { x: 3075, y: 2007 },
    },
    qrPos: { x: 2642, y: 629, size: 240 },
    stampDebug: {
      x: 2925,
      y: 1859,
      size: 401,
      starSize: 0.3,
      orgSize: 0.1666,
      orgHeight: 1.0,
      orgStretch: 0.6,
      orgDistribution: 0.9,
      codeDistribution: 1.4,
      enablePostBold: true,
      postBoldStrength: 1,
      enableBoldNoise: true,
      boldNoiseStrength: 80,
    },
    style: {
      fontFamily: SONG_FONT_STACK,
      titleFontSize: 50,
      fontSize: 50,
      codeFontSize: 49,
      scopeFontSize: 50,
      scopeLineHeight: 60,
      scopeMaxWidth: 1200,
      lineHeight: 60,
      isBold: false,
    },
  },
  template4: {
    bgSrc: "/bg4.png",
    textColor: "#000000",
    qrColor: "#000000",
    pos: {
      code: { x: 384, y: 804 },
      name: { x: 770, y: 1215 },
      type: { x: 770, y: 1371 },
      rep: { x: 770, y: 1525 },
      capital: { x: 2690, y: 1215 },
      date_found: { x: 2690, y: 1369 },
      term: { x: 0, y: 0 },
      address: { x: 2690, y: 1510 },
      scope: { x: 770, y: 1675 },
      year: { x: 2980, y: 2413 },
      month: { x: 3210, y: 2413 },
      day: { x: 3410, y: 2413 },
    },
    qrPos: { x: 3052, y: 708, size: 240 },
    stampDebug: {
      x: 3220,
      y: 2244,
      size: 450,
      starSize: 0.3,
      orgSize: 0.1666,
      orgHeight: 1.0,
      orgStretch: 0.6,
      orgDistribution: 0.9,
      codeDistribution: 1.4,
      enablePostBold: true,
      postBoldStrength: 1,
      enableBoldNoise: true,
      boldNoiseStrength: 80,
    },
    style: {
      fontFamily: SONG_FONT_STACK,
      titleFontSize: 60,
      fontSize: 60,
      codeFontSize: 60,
      scopeFontSize: 60,
      scopeLineHeight: 60,
      scopeMaxWidth: 1200,
      lineHeight: 60,
      isBold: false,
    },
  },
};

const TEMPLATE_KEYS: TemplateKey[] = ["print", "template4", "photo", "template3"];

export function cloneDefaultTemplates(): TemplatesConfig {
  return structuredClone(DEFAULT_TEMPLATES);
}

export function normalizeSavedTemplates(input: unknown): TemplatesConfig {
  const defaults = cloneDefaultTemplates();

  if (!input || typeof input !== "object") {
    return defaults;
  }

  const savedTemplates = input as Partial<Record<TemplateKey, Partial<LicenseTemplate>>>;

  for (const key of TEMPLATE_KEYS) {
    const savedTemplate = savedTemplates[key];

    if (!savedTemplate || typeof savedTemplate !== "object") {
      continue;
    }

    defaults[key] = {
      ...defaults[key],
      ...savedTemplate,
      pos: {
        ...defaults[key].pos,
        ...(savedTemplate.pos ?? {}),
        term: {
          ...defaults[key].pos.term,
          ...(savedTemplate.pos?.term ?? {}),
        },
      },
      qrPos: {
        ...defaults[key].qrPos,
        ...(savedTemplate.qrPos ?? {}),
      },
      stampDebug: {
        ...defaults[key].stampDebug,
        ...(savedTemplate.stampDebug ?? {}),
      },
      style: {
        ...defaults[key].style,
        ...(savedTemplate.style ?? {}),
      },
    };
  }

  return defaults;
}
