<script lang="ts">
  export let manaBase: { category: string; cards: string[] }[] = [];
</script>

{#if manaBase.length > 0}
  <h2>Recommended Mana Base</h2>
  {#each manaBase as section}
    <h3>{section.category}</h3>
    <ul>
      {#each section.cards as card}
        <li>{card}</li>
      {/each}
    </ul>
  {/each}
{/if}
