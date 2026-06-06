<div class="Grid_3_Column">
    <div id="left_column">

    </div>
<div id="center_column" class="center_column">
    <div id="center_column_1st_row" class="center_column">

        <div>
            <label for="Schema_Name_Input">
                Schema Name
            </label>
            <input id="Schema_Name_Input">
        </div>
        <label for="Data_Type_Select"> Select Data Type</label>
        <select id="Data_Type_Select"></select>
    </div>
    <div id="center_column_2nd_row">
        <div> Identifiers</div>
        <div> Properties</div>
        <div> Constraints</div>
    </div>
    <div id="right_column">
        
    </div>
</div>
</div>

<style>
    .Grid_3_Column {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        height: 80vh;
        max-width: 100%;
    }
    .center_column {
        display: flex;
        flex-direction: column;
    }
</style>

<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import type { Schema, Data_Type } from "$lib/Schema/models";
import { Handle_Data_Type_Select, Create_Options_In_Select_From_Array, Make_Searchable_Select } from "$lib/utils";
  onMount(() => {
        if (browser) {
            const types = [
                'String',
                'Number',
                'Boolean',
                'Interface',
                'Associative_Array'
            ]
            const list = ['Independent Clause',
                'Dependent Clause',
                'Complex Sentence',
                'Subordinating Conjunction',
                'Coordinating Conjunction'
            ]
            const Data_Type_Select: HTMLSelectElement = document.getElementById('Data_Type_Select') as HTMLSelectElement
            const center_column: HTMLDivElement = document.getElementById('center_column') as HTMLDivElement
            const first_row_center_column: HTMLDivElement = document.getElementById('center_column_1st_row') as HTMLDivElement
            Create_Options_In_Select_From_Array(Data_Type_Select,
                types
            )
            Handle_Data_Type_Select(Data_Type_Select,
                list, first_row_center_column
            )
            /**
             * make a option element for every type in the type
             * make the value and text content equal to the item
             * add a event listener of select element
             * based on selection create or delete other ui elements
             * 
             * 
            */

        }
    });
</script>