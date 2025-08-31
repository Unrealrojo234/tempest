<script>
  export let value = 0;
  export let max = 5;
  export let size = 30;
  export let disabled = false;
  export let name = 'rating';
  
  // Generate array of star values
  const stars = Array.from({ length: max }, (_, i) => max - i);
  
  function handleClick(ratingValue) {
    if (!disabled) {
      value = ratingValue;
    }
  }
  
  function handleMouseOver(ratingValue) {
    if (!disabled) {
      // For visual feedback on hover (handled in CSS)
    }
  }
</script>

<div class="rating" class:disabled>
  {#each stars as star}
    <input 
      type="radio" 
      {name}
      id={`${name}-star${star}`}
      value={star}
      checked={value === star}
      {disabled}
    />
    <label
      title={`${star} star${star !== 1 ? 's' : ''}`}
      for={`${name}-star${star}`}
      on:click={() => handleClick(star)}
      on:mouseover={() => handleMouseOver(star)}
      style={`font-size: ${size}px;`}
    ></label>
  {/each}
</div>

<style>
  .rating:not(.disabled) > input {
    position: absolute;
    appearance: none;
  }

  .rating:not(.disabled) > label {
    float: right;
    cursor: pointer;
    color: #cbd5e1; /* Light gray for unselected stars */
    transition: color 0.2s ease;
  }

  .rating:not(.disabled) > label:before {
    content: '★';
  }

  /* Checked state - purple color */
  .rating:not(.disabled) > input:checked ~ label {
    color: #6a11cb; /* Purple */
  }

  /* Hover effects - teal color */
  .rating:not(.disabled) > label:hover,
  .rating:not(.disabled) > label:hover ~ label {
    color: #14b8a6; /* Teal */
  }

  /* Checked + hover state */
  .rating:not(.disabled) > input:checked + label:hover,
  .rating:not(.disabled) > input:checked + label:hover ~ label,
  .rating:not(.disabled) > input:checked ~ label:hover,
  .rating:not(.disabled) > input:checked ~ label:hover ~ label {
    color: #0d9488; /* Darker teal */
  }

  /* Disabled state */
  .rating.disabled > input {
    display: none;
  }

  .rating.disabled > label {
    float: right;
    color: #cbd5e1;
    cursor: default;
  }

  .rating.disabled > label:before {
    content: '★';
  }

  .rating.disabled > input:checked ~ label {
    color: #6a11cb; /* Purple for selected stars even when disabled */
  }
</style>