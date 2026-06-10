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
        <div id="idenitifer_div"> 
            <label for="identifier_button">
                Identifiers
            </label>
            <button id="identifier_button" >
                +
            </button>
            
        </div>
        <div id="property_div"> 
            <label for="property_button">
                Properties
            </label>
            <button id="property_button" >
                +
            </button>
        </div>
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
import { Make_Searchable_Select_Schema, Handle_Data_Type_Select, Create_Options_In_Select_From_Array, Make_Searchable_Select } from "$lib/utils";
  onMount(() => {
        if (browser) {
            const Definition: Schema = {'name': 'Definition', 'data_type': 'String'}
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
            const center_column_2nd_row: HTMLDivElement = document.getElementById('center_column_2nd_row') as HTMLDivElement
            const identifier_div: HTMLDivElement = document.getElementById('idenitifer_div') as HTMLDivElement

            const Identifiers_Button: HTMLButtonElement = document.getElementById('identifier_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(Identifiers_Button, [Definition], identifier_div)
            const property_div: HTMLDivElement = document.getElementById('property_div') as HTMLDivElement
            const property_button: HTMLButtonElement = document.getElementById('property_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(property_button, [Definition], property_div)

        }
    });
</script>