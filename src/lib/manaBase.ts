import bondLands from "./data/bondLands.json";
import fetchLands from "./data/fetchLands.json";
import shockLands from "./data/shockLands.json";
import OGDualLands from "./data/OGDualLands.json";
import checkLands from "./data/checkLands.json";
import painLands from "./data/painLands.json";
import slowLands from "./data/slowLands.json";
import filterLands from "./data/filterLands.json";
import horizonLands from "./data/horizonLands.json";
import tangoLands from "./data/tangoLands.json";
import pathwayLands from "./data/pathwayLands.json";
import bounceLands from "./data/bounceLands.json";
import triomes from "./data/triomes.json";
import utilityLands from "./data/utilityLands.json";
import manaRocks from "./data/manaRocks.json";

export type ColorOption = "W" | "U" | "B" | "R" | "G";

// All land types have: type, count, options
export type ManaBaseCardEntry = {
  type: string;
  count: number;
  options: { name: string }[];
};

export type ManaBaseEntry = {
  category: string;
  cards: ManaBaseCardEntry[];
};

/**
  TODO:
  - Add ability to skip OG Duals
  - Utility lands fugly + add search
  - Mana rocks fugly + add search
  - Handle tango lands better / add alternative if tango land missing ?
*/

function filterLandsByColors<T extends { colors: string[]; name: string }>(
  lands: T[],
  colors: ColorOption[],
  matchAnyColor = false // default: all colors must match
): { name: string }[] {
  return lands
    .filter((land) =>
      matchAnyColor
        ? land.colors.some((c) => colors.includes(c as ColorOption))
        : land.colors.every((c) => colors.includes(c as ColorOption))
    )
    .map((land) => ({ name: land.name }));
}

function getBasic(colors: ColorOption[], count: number): { name: string }[] {
  const basicLandNames = {
    W: "Plains",
    U: "Island",
    B: "Swamp",
    R: "Mountain",
    G: "Forest",
  };
  const basicLands = colors.map((color) => ({
    name: basicLandNames[color],
  }));
  return basicLands;
}

export function getManaBase(colors: ColorOption[]): ManaBaseEntry[] {
  const numColors = colors.length;

  if (numColors === 0) {
    return [
      {
        category: "Error",
        cards: [
          {
            type: "Please select at least one color.",
            count: 1,
            options: [{ name: "Please select at least one color." }],
          },
        ],
      },
    ];
  }

  if (numColors > 3) {
    return [
      {
        category: "Warning",
        cards: [
          {
            type: "Mana base suggestions for 4+ colors are not yet implemented. ",
            count: 1,
            options: [
              {
                name: "Mana base suggestions for 4+ colors are not yet implemented.",
              },
            ],
          },
        ],
      },
    ];
  }

  if (numColors === 1) {
    return [
      {
        category: "Basic Lands",
        cards: [
          {
            type: "basic",
            count: 29,
            options: getBasic(colors, 29),
          },
        ],
      },
      {
        category: "Utility Lands",
        cards: [
          {
            type: "utility",
            count: 9,
            options: utilityLands.map((l) => ({ name: l.name })),
          },
        ],
      },
      {
        category: "Mana Rocks",
        cards: [
          {
            type: "manaRock",
            count: 5,
            options: manaRocks.map((r) => ({ name: r.name })),
          },
        ],
      },
    ];
  }

  if (numColors === 2) {
    return [
      {
        category: "Basic Lands",
        cards: [
          {
            type: "basic",
            count: 12,
            options: getBasic(colors, 12),
          },
        ],
      },
      {
        category: "Staple Lands",
        cards: [
          {
            type: "fetchLand",
            count: 4,
            options: filterLandsByColors(fetchLands, colors, true),
          },
          {
            type: "OGDualLand",
            count: 1,
            options: filterLandsByColors(OGDualLands, colors),
          },
          {
            type: "shockLand",
            count: 1,
            options: filterLandsByColors(shockLands, colors),
          },
          {
            type: "bondLand",
            count: 1,
            options: filterLandsByColors(bondLands, colors),
          },
          {
            type: "slowLand",
            count: 1,
            options: filterLandsByColors(slowLands, colors),
          },
          {
            type: "painLand",
            count: 1,
            options: filterLandsByColors(painLands, colors),
          },
          {
            type: "checkLand",
            count: 1,
            options: filterLandsByColors(checkLands, colors),
          },
          {
            type: "pathwayLand",
            count: 1,
            options: filterLandsByColors(pathwayLands, colors),
          },
          {
            type: "filterLand",
            count: 1,
            options: filterLandsByColors(filterLands, colors),
          },
          {
            type: "horizonLand",
            count: 1,
            options: filterLandsByColors(horizonLands, colors, true), // matchAnyColor = true
          },
          {
            type: "tangoLand",
            count: 1,
            options: filterLandsByColors(tangoLands, colors),
          },
          {
            type: "bounceLand",
            count: 1,
            options: filterLandsByColors(bounceLands, colors),
          },
        ],
      },
      {
        category: "Utility Lands",
        cards: [
          {
            type: "utility",
            count: 7,
            options: utilityLands.map((l) => ({ name: l.name })),
          },
        ],
      },
      {
        category: "Mana Rocks",
        cards: [
          {
            type: "manaRock",
            count: 5,
            options: manaRocks.map((r) => ({ name: r.name })),
          },
        ],
      },
    ];
  }

  if (numColors === 3) {
    return [
      {
        category: "Basic Lands",
        cards: [
          {
            type: "basic",
            count: 9,
            options: getBasic(colors, 8),
          },
        ],
      },
      {
        category: "Staple Lands",
        cards: [
          {
            type: "triome",
            count: 1,
            options: filterLandsByColors(triomes, colors),
          },
          {
            type: "fetchLand",
            count: 8,
            options: filterLandsByColors(fetchLands, colors, true),
          },
          {
            type: "OGDualLand",
            count: 3,
            options: filterLandsByColors(OGDualLands, colors),
          },
          {
            type: "shockLand",
            count: 3,
            options: filterLandsByColors(shockLands, colors),
          },
          {
            type: "bondLand",
            count: 3,
            options: filterLandsByColors(bondLands, colors),
          },
          {
            type: "slowLand",
            count: 3,
            options: filterLandsByColors(slowLands, colors),
          },
          {
            type: "horizonLand",
            count: 2,
            options: filterLandsByColors(horizonLands, colors, true), // matchAnyColor = true
          },
        ],
      },
      {
        category: "Utility Lands",
        cards: [
          {
            type: "utility",
            count: 5,
            options: utilityLands.map((l) => ({ name: l.name })),
          },
        ],
      },
      {
        category: "Mana Rocks",
        cards: [
          {
            type: "manaRock",
            count: 5,
            options: manaRocks.map((r) => ({ name: r.name })),
          },
        ],
      },
    ];
  }

  // fallback, should never hit
  return [];
}
