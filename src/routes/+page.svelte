<script lang="ts">
  import "../app.css";
  import { base } from "$app/paths";

  import {
    getManaBase,
    type ColorOption,
    type ManaBaseEntry,
    type ManaBaseCardEntry,
  } from "$lib/manaBase";
  import utilityLands from "$lib/data/utilityLands.json";
  import manaRocks from "$lib/data/manaRocks.json";

  let colors: Record<ColorOption, boolean> = {
    W: false,
    U: false,
    B: false,
    R: false,
    G: false,
  };

  let manaBaseResults: ManaBaseEntry[] = [];
  let selectedUtilityLands: Record<string, boolean> = {};
  let selectedManaRocks: Record<string, boolean> = {};
  let selectedLands: Record<string, number> = {};

  // All selectable land types should always have count:number and options:{name:string}[]
  const selectableLandTypes = [
    "fetchLand",
    "shockLand",
    "OGDualLand",
    "ogDualLand",
    "checkLand",
    "painLand",
    "slowLand",
    "filterLand",
    "horizonLand",
    "tangoLand",
    "pathwayLand",
    "bounceLand",
    "triome",
    "bondLand",
  ];

  function generateManaBase() {
    const selectedColors = Object.entries(colors)
      .filter(([_, val]) => val)
      .map(([key]) => key as ColorOption);

    manaBaseResults = getManaBase(selectedColors);

    // Initialize selections for bond lands and other selectable lands
    manaBaseResults.forEach((entry, entryIdx) => {
      entry.cards.forEach((card, cardIdx) => {
        // All selectable lands must have count:number and options:{name:string}[]
        if (
          selectableLandTypes.includes(card.type) &&
          card.options &&
          typeof card.count === "number"
        ) {
          for (let i = 0; i < card.count; i++) {
            const key = `${entryIdx}-${cardIdx}-${i}`;
            selectedLands[key] = i < card.options.length ? i : 0;
          }
        }
      });
    });
  }

  function getAvailableLandOptions(
    card: ManaBaseCardEntry,
    entryIdx: number,
    cardIdx: number,
    landIdx: number
  ): { option: { name: string }; oidx: number }[] {
    if (
      !selectableLandTypes.includes(card.type) ||
      !card.options ||
      typeof card.count !== "number"
    ) {
      return [];
    }
    const selectedIndices: number[] = [];
    for (let i = 0; i < card.count; i++) {
      if (i !== landIdx) {
        selectedIndices.push(selectedLands[`${entryIdx}-${cardIdx}-${i}`]);
      }
    }
    return card.options
      .map((option: { name: string }, oidx: number) => ({ option, oidx }))
      .filter(({ oidx }) => !selectedIndices.includes(oidx));
  }

  $: copyOutput = manaBaseResults
    .map((entry, entryIdx) =>
      entry.cards
        .map((card, cardIdx) => {
          if (
            selectableLandTypes.includes(card.type) &&
            card.options &&
            typeof card.count === "number"
          ) {
            return Array(card.count)
              .fill(0)
              .map((_, landIdx) => {
                const sel =
                  selectedLands[`${entryIdx}-${cardIdx}-${landIdx}`] ?? 0;
                const name = card.options[sel]?.name ?? card.type;
                return `1 ${name}`;
              })
              .join("\n");
          }
          if (card.type === "manaRock") {
            return Object.entries(selectedManaRocks)
              .filter(([_, checked]) => checked)
              .map(([name]) => `1 ${name}`)
              .join("\n");
          }
          if (card.type === "utility") {
            return Object.entries(selectedUtilityLands)
              .filter(([_, checked]) => checked)
              .map(([name]) => `1 ${name}`)
              .join("\n");
          }
          if (card.type === "basic") {
            // Evenly distribute the count among all basic types
            const total = card.count;
            const basics = card.options;
            const perType = Math.floor(total / basics.length);
            const remainder = total % basics.length;
            return basics
              .map((basic, i) => {
                const count = perType + (i < remainder ? 1 : 0);
                return count > 0 ? `${count} ${basic.name}` : "";
              })
              .filter(Boolean)
              .join("\n");
          }
          if ("label" in card) return card.label;
          if ("count" in card)
            return `${card.count} ${card.type.replace(/([A-Z])/g, " $1")}`;
          return "";
        })
        .join("\n")
    )
    .join("\n\n");

  let copied = false;
  function copyToClipboard() {
    navigator.clipboard.writeText(copyOutput);
    copied = true;
    setTimeout(() => (copied = false), 1200);
  }

  function formatLandType(type: string) {
    return type.replace(/([A-Z])/g, " $1").replace("O G", "OG ");
  }

  function manaRockMatchesDeck(
    manaRock: { colors?: string[] },
    deckColors: string[]
  ): boolean {
    if (!manaRock.colors || manaRock.colors.length === 0) return true; // colorless or universal
    // Only show if all manaRock.colors are in deckColors, and manaRock.colors does not contain any color not in deckColors
    return (
      manaRock.colors.every((c) => deckColors.includes(c)) &&
      manaRock.colors.length <= deckColors.length
    );
  }

  function landTypeBadge(type: string) {
    // You can expand this for more types or use icons
    const map: Record<string, string> = {
      fetchLand: "Fetch Land",
      shockLand: "Shock Land",
      OGDualLand: "OG Dual",
      checkLand: "Check Land",
      painLand: "Pain Land",
      slowLand: "Slow Land",
      filterLand: "Filter Land",
      horizonLand: "Horizon Land",
      tangoLand: "Tango Land",
      pathwayLand: "Pathway Land",
      bounceLand: "Bounce Land",
      triome: "Triome",
      bondLand: "Bond Land",
    };
    return map[type] || type.replace(/([A-Z])/g, " $1").trim();
  }
</script>

<div class="min-h-screen bg-zinc-900 text-gray-100">
  <main class="p-8 max-w-xl mx-auto space-y-6">
    <h1 class="text-4xl font-bold text-yellow-400 mb-2">
      EDH Mana Base Helper
    </h1>

    <div class="space-y-4">
      <p class="text-lg font-medium text-gray-300">Choose your colors:</p>
      <div class="grid grid-cols-5 gap-4">
        {#each Object.keys(colors) as color}
          <label
            class="inline-flex items-center space-x-2 rounded transition"
            class:bg-yellow-900={colors[color as ColorOption]}
            style="padding: 0.25rem 0.5rem;"
          >
            <input
              type="checkbox"
              bind:checked={colors[color as ColorOption]}
              class="h-5 w-5 text-emerald-500 bg-zinc-800 border-zinc-600 rounded focus:ring-0 transition"
              aria-label={`Select color ${color}`}
            />
            <span class="font-semibold text-gray-200">{color}</span>
          </label>
        {/each}
      </div>
    </div>

    <button
      on:click={generateManaBase}
      class="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-500 transition flex items-center gap-2 shadow-md"
      aria-label="Generate Mana Base"
    >
      ⚔️ Generate Mana Base
    </button>

    {#if manaBaseResults.length > 0}
      <div class="mt-8 space-y-6 fade-in">
        {#each manaBaseResults as entry, entryIdx}
          <div>
            <h2
              class="text-2xl font-semibold text-yellow-300 mb-2 flex items-center gap-2"
            >
              {entry.category}
            </h2>
            <ul class="list-disc list-inside space-y-1">
              {#each entry.cards as card, cardIdx}
                {#if selectableLandTypes.includes(card.type)}
                  <li
                    class="text-gray-300 hover:text-emerald-400 transition font-semibold"
                  >
                    {card.count} x
                    <span
                      class="inline-block px-2 py-0.5 rounded bg-yellow-700 text-xs align-middle ml-1 mr-2"
                    >
                      {landTypeBadge(card.type)}
                    </span>
                    <ul
                      class="test rounded ml-12 grid grid-cols-2 gap-x-14 gap-y-1 list-disc pl-8"
                    >
                      {#each Array(card.count) as _, landIdx}
                        <li>
                          <select
                            bind:value={
                              selectedLands[`${entryIdx}-${cardIdx}-${landIdx}`]
                            }
                            class="bg-zinc-700 text-gray-100 rounded border border-zinc-700 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 px-2 py-1 transition duration-150 w-full"
                          >
                            {#each getAvailableLandOptions(card, entryIdx, cardIdx, landIdx) as { option, oidx }}
                              <option value={oidx}>{option.name}</option>
                            {/each}
                          </select>
                        </li>
                      {/each}
                    </ul>
                  </li>
                {:else if card.type === "basic"}
                  <li
                    class="text-gray-300 font-semibold flex items-center gap-2"
                  >
                    {card.count} x
                    <span
                      class="inline-block px-2 py-0.5 rounded bg-yellow-700 text-xs align-middle ml-1 mr-2"
                    >
                      Basic Land
                    </span>
                    <div class="flex gap-1">
                      {#each Object.keys(colors).filter((c) => colors[c as ColorOption]) as color}
                        <img
                          src={`/icons/${color.toLowerCase()}.svg`}
                          alt="{color} mana"
                          title={color}
                          class="w-3 h-3"
                        />
                      {/each}
                    </div>
                  </li>
                {:else if card.type === "utility"}
                  <li
                    class="text-gray-300 hover:text-emerald-400 transition font-semibold"
                  >
                    {card.count} Utility Lands:
                    <div
                      class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mt-2 custom-scroll"
                    >
                      {#each utilityLands as land}
                        <label
                          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 transition"
                        >
                          <input
                            type="checkbox"
                            bind:checked={selectedUtilityLands[land.name]}
                            class="h-4 w-4 rounded border-2 border-emerald-500 bg-zinc-900 checked:bg-emerald-500 checked:border-emerald-400 focus:ring-emerald-600 transition"
                            aria-label={`Select utility land ${land.name}`}
                          />
                          <span>{land.name}</span>
                          <span class="text-xs text-gray-400"
                            >({land.category})</span
                          >
                        </label>
                      {/each}
                    </div>
                  </li>
                {:else if card.type === "manaRock"}
                  <li
                    class="text-gray-300 hover:text-emerald-400 transition font-semibold"
                  >
                    {card.count} Mana Rocks:
                    <div
                      class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mt-2 custom-scroll"
                    >
                      {#each manaRocks.filter( (rock) => manaRockMatchesDeck( rock, Object.keys(colors).filter((c) => colors[c as ColorOption]) ) ) as rock}
                        <label
                          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 transition"
                        >
                          <input
                            type="checkbox"
                            bind:checked={selectedManaRocks[rock.name]}
                            class="h-4 w-4 rounded border-2 border-emerald-500 bg-zinc-900 checked:bg-emerald-500 checked:border-emerald-400 focus:ring-emerald-600 transition"
                            aria-label={`Select mana rock ${rock.name}`}
                          />
                          <span>{rock.name}</span>
                          {#if rock.tier}
                            <span class="text-xs text-gray-400"
                              >(Tier {rock.tier})</span
                            >
                          {/if}
                        </label>
                      {/each}
                    </div>
                  </li>
                {:else if "label" in card}
                  <li class="text-gray-300 hover:text-emerald-400 transition">
                    {card.label}
                  </li>
                {/if}
              {/each}
            </ul>
            <hr class="my-4 border-zinc-700 opacity-40" />
          </div>
        {/each}
        <hr class="my-6 border-yellow-700 opacity-50" />
        <div class="mt-8">
          <h3 class="font-bold mb-2">Copyable Output</h3>
          <textarea
            readonly
            rows="10"
            class="w-full bg-zinc-800 text-yellow-200 border border-yellow-500 shadow-lg rounded p-2 focus:outline-none resize-none copy-scroll"
            style="font-family: monospace; letter-spacing: 0.5px;"
            aria-label="Copyable mana base output">{copyOutput}</textarea
          >
          <button
            class="mt-2 bg-yellow-400 text-black px-4 py-1 rounded shadow-md hover:shadow-lg transition"
            on:click={copyToClipboard}
            aria-label="Copy output to clipboard"
          >
            Copy Output
          </button>
          {#if copied}
            <span class="ml-3 text-emerald-400 font-semibold fade-in"
              >Copied!</span
            >
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  /* Custom scrollbars for utility/mana rock sections */
  .custom-scroll {
    scrollbar-width: thin;
    scrollbar-color: #059669 #18181b;
  }
  .custom-scroll::-webkit-scrollbar {
    width: 8px;
    background: #18181b;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #059669;
    border-radius: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: #18181b;
  }
  .copy-scroll {
    scrollbar-width: thin;
    scrollbar-color: #fde047 #18181b; /* yellow-300 thumb, zinc-900 track */
  }
  .copy-scroll::-webkit-scrollbar {
    width: 8px;
    background: #18181b;
  }
  .copy-scroll::-webkit-scrollbar-thumb {
    background: #fde047;
    border-radius: 6px;
  }
  .copy-scroll::-webkit-scrollbar-track {
    background: #18181b;
  }
  input[type="checkbox"].checked\:bg-emerald-500:checked {
    background-color: #059669;
    border-color: #34d399;
  }
  /* Fade-in animation for results and copied message */
  .fade-in {
    animation: fadeIn 0.5s;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  button {
    transition:
      box-shadow 0.2s,
      background 0.2s;
    box-shadow: 0 1px 4px #0002;
  }
  button:hover {
    filter: brightness(1.1);
    box-shadow: 0 2px 8px #fde04744;
  }
  ul.grid,
  ul.list-disc {
    margin-top: 4px !important;
    margin-left: 0 !important;
    list-style-type: disc !important;
  }
</style>
