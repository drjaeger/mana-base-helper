<script lang="ts">
  export let title: string;
  export let cards: { name: string; image: string }[] = [];
</script>

<div class="mb-6">
  <h3 class="text-xl font-bold mb-2">{title}</h3>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {#each cards as card}
      <div
        class="border border-gray-600 rounded-lg p-2 bg-gray-800 text-center"
      >
        <img src={card.image} alt={card.name} class="rounded mb-2" />
        <p class="text-sm">{card.name}</p>
      </div>
    {/each}
  </div>
</div>
