<div class="main">
    <div class="header" id="header"> 
        <button id="new_schema_button"> New Schema</button>
        <div id="facted_search"> Faceted Search 
            <select id="Search_Target"> Search Target</select>
        </div>
        <button> Settings </button>
    </div>
    <div id="Chronicle"> Chronicle</div>

</div>
/**

*/
<script lang="ts">
import { Render_Options } from "$lib/utils";
import type { Schema } from "$lib/Schema/models";
function Handle_Search_Target_Select(select: HTMLSelectElement,
    container: HTMLDivElement
) {
    select.value = ''
    select.addEventListener('input', function() {
        /**
         * 
         * press enter to search
         * button to add filter
         * co
         *  filter creates element which can be deleted or edited
         *  
         * form appears with:
         * field (dropdown but allow to type)
         * operator (dropdown)
         * value (show existent value but allow to enter)
        */
       const schemas: Schema[] = [{'name': 'Color', 'data_type': 'String'},
            {'name': 'Age', 'data_type': 'Number'}
       ] /**Make to api call*/
       Make_Searchable_Select(schemas, container)
       const add_filter_button = document.createElement('button') as HTMLButtonElement
    
    })
}

export async function Make_Searchable_Select(
    schemas: Schema[],
    container: HTMLDivElement,
): Promise<HTMLSelectElement> {
    
    const search_input = document.createElement('input');
    search_input.type = 'text';
    search_input.placeholder = 'Search...';
    const select = document.createElement('select');
    select.size = 10;
    
    search_input.addEventListener('input', () => {
        select.style.display = '';
        Render_Options(
            schemas,
            select,
            search_input.value
        );
    });
    search_input.addEventListener('click', () => {
        select.style.display = ''
        Render_Options(
            schemas,
            select,
            search_input.value
        );
    })

   
    select.addEventListener('input', function() {
        // select.style.display = 'none';
        // const p = document.createElement('p')
        // p.textContent = this.textContent
        // const delete_button = document.createElement('button')
        // delete_button.textContent = 'x'
        

        // container.appendChild(p)
        // container.appendChild(delete_button)
    })
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // If click is outside both the input and the select, hide the select
        if (target !== search_input && !select.contains(target)) {
            select.style.display = 'none';
        }
    });

    container.appendChild(search_input);
    container.appendChild(select);

    return select;
}
function Handle_Add_Filter(button: HTMLButtonElement) {
    button.addEventListener('click', function() {
        const form: HTMLFormElement = document.createElement('form')
        //searchable element for field

        const Filter_Operator: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
        const filter_operators: string[] = ['equals',
         'contains',
        'greater_than',
        'less_than',
        'has_field',
        'has_element',
        'has_property'] /** change to api call from db later*/
        Create_Options_In_Select_From_Array(Filter_Operator, filter_operators)
        //**
        // after field is selected, make appropiate input element according to type
        // and enforce type on the value, error checking*/
        //searchable 
    })
}

import { onMount } from "svelte";
import { browser } from "$app/environment";
import { Make_Button_Goto_URL } from "$lib/utils";
import { Create_Options_In_Select_From_Array } from "$lib/utils";
    onMount(() => {
      if (browser) {
            const new_schema_button: HTMLButtonElement = document.getElementById('new_schema_button') as HTMLButtonElement

            Make_Button_Goto_URL(new_schema_button, 'Schema/Definition')
        }
            const Search_Targets = ['schemas', 'instances', 'activity']
            const Search_Target: HTMLSelectElement = document.getElementById('Search_Target') as HTMLSelectElement
            Create_Options_In_Select_From_Array(Search_Target, Search_Targets)
            const facted_search_container: HTMLDivElement = document.getElementById('facted_search') as HTMLDivElement
            Handle_Search_Target_Select(Search_Target, facted_search_container)
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