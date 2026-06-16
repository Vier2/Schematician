<div class="main">
    <div class="header" id="header"> 
        <button id="new_schema_button"> New Schema</button>
        <div id="facted_search"> Faceted Search </div>
        <button> Settings </button>
    </div>
    <div id="Chronicle"> Chronicle</div>

</div>
<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import { Make_Button_Goto_URL } from "$lib/utils";
    onMount(() => {
      if (browser) {
            const new_schema_button: HTMLButtonElement = document.getElementById('new_schema_button') as HTMLButtonElement

            Make_Button_Goto_URL(new_schema_button, 'Schema/Definition')
        }
            });
</script>

<style>
    .main {
        display: grid;
        grid-template-rows: 15% 85%;
        height: 97vh;
        width: 99vw;

    }
    .header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        
    }
</style>