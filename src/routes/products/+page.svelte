<script lang=ts>
	import { onMount } from "svelte";

	export let data: any;


	let products=data.payload;





</script>




{#each products as item}

<h1> {item.name} </h1>
	 
{/each}


