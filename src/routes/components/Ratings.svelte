<script>
    export let rating = 0;
    export let maxRating = 5;
    export let size = "24px";
    export let activeColor = "#fd0";
    export let inactiveColor = "#ddd";
</script>

<div class="star-rating" aria-label="Rating: {rating} out of {maxRating}">
    {#each Array(maxRating) as _, i}
        {#if i + 1 <= rating}
            <!-- Full star -->
            <span class="star" style="color: {activeColor}; font-size: {size}; text-shadow: 0 0 2px {activeColor};">★</span>
        {:else if i < rating && rating % 1 >= 0.5}
            <!-- Half star -->
            <span class="star" style="background: linear-gradient(90deg, {activeColor} 50%, {inactiveColor} 50%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: {size};">★</span>
        {:else}
            <!-- Empty star -->
            <span class="star" style="color: {inactiveColor}; font-size: {size};">★</span>
        {/if}
    {/each}
</div>

<style>
    .star-rating {
        display: inline-block;
        line-height: 1;
    }
    
    .star {
        display: inline-block;
    }
</style>