<div class="main">
    <div class="header" id="header"> 
        <button id="new_schema_button"> New Schema</button>
        <div id="faceted_search" class="faceted_search"> Faceted Search 
            <select id="Search_Target"> Search Target</select>
        </div>
        <button> Settings </button>
    </div>
    <div id="Chronicle"> Chronicle</div>

</div>

<script lang="ts">
import { Render_Search_Schema_Value_Recursive, Render_Options_Schema, Make_Schema_Input_View, Make_Viewer_Element } from "$lib/utils";
import type { Filter_Operator, Search_Filter, Search_Query, Schema ,Schema_Association} from "$lib/Schema/models"; 
function Handle_Search_Target_Select(select: HTMLSelectElement,
    container: HTMLDivElement,
    search_query_state: Search_Query
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
        const Selected_Option = select.options[select.selectedIndex];
        search_query_state.target = Selected_Option.value as Search_Target

        const Definition: Schema = {'name': 'Definition', 'data_type': 'String'}

       const Independent_Clause: Schema = {'name': 'Independent Clause', 
                'data_type': 'String'}
            const Dependent_Clause_Identifier: Schema_Association[] = [
                {'schema': Definition,
                'value': `a group of words that contains a subject and a verb but cannot stand alone as a complete sentence`
                }
            ]
            const Dependent_Clause: Schema = {'name': 'Dependent Clause', 
                'data_type': 'String',
            'identifiers': Dependent_Clause_Identifier
        }
            const Subordinating_Conjunction_identifiers: Schema_Association[] = 
            [{'schema': Definition, 'value': ` a word or phrase that connects a dependent clause (a fragment that cannot stand alone) to an independent clause (a complete thought)`}]
            const Subordinating_Conjunction: Schema  = {
                'name': 'Subordinating Conjunction',
                'data_type': 'String',
                'identifiers': Subordinating_Conjunction_identifiers,
                'constraints': {
                    'maximum_characters': 8
                },
                'enumerations': [
                    'because',
                    'since',
                    'until',
                    'once',
                    'although'
                    
                ],}
            const Coordinating_Conjunction_identifiers: Schema_Association[] = 
            [{"schema": Definition, 'value': `
            a word that connects words, phrases, or clauses of equal grammatical rank`}]
            const Coordinating_Conjunction: Schema = {
                'name': 'Coordinating Conjunction',
                'data_type': 'String',
                'options': [
                    'For',
                    'And',
                    'Nor',
                    'But',
                    'Or',
                    'Yet',
                    'So'
                ],
                'constraints': {
                    'maximum_characters': 3
                },
                'identifiers': Coordinating_Conjunction_identifiers
            }
            const Complex_Sentence_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': `
             a sentence that combines one independent clause with at least one dependent clause`}]
            const Complex_Sentence: Schema = {'name': 'Complex Sentence', 'data_type': 'Interface', 
                'elements': [Independent_Clause, 
                Subordinating_Conjunction,
                Dependent_Clause, Coordinating_Conjunction],
                'identifiers': Complex_Sentence_Identifiers
            }
            const city: Schema = {'name': 'City', 'data_type': 'String'}
            const state: Schema = {'name': 'State', 'data_type': 'String'}
            const postal_code: Schema = {'name': 'Postal Code', 'data_type': 'String'}
            const Address: Schema = {'name': 'Address', 'data_type': 'Interface',
                'elements': [city, state, postal_code]
            }
            
            const schemas: Schema[] = [{'name': 'Color', 'data_type': 'String'},
                    {'name': 'Age', 'data_type': 'Number'}, Complex_Sentence, Address
            ] /**Make to api call*/
            Make_Searchable_Select(schemas, container, 'Field', search_query_state)
            const add_filter_button = document.createElement('button') as HTMLButtonElement
    
    })
}

function Add_Search_Filter_Row(
    schema: Schema,
    container: HTMLDivElement,
    search_query_state: Search_Query
) {
    const filter: Search_Filter = {
        field_schema: schema,
        operator: 'equals'
    }

    search_query_state.filters ??= []
    search_query_state.filters.push(filter)

    const row = document.createElement('div')

    const field_operator = ['equals',
                            'contains',
                            'greater_than',
                            'less_than',
                            'has_field',
                            'has_element',
                            'has_property']
    const field_operator_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
        
    Create_Options_In_Select_From_Array(field_operator_select, field_operator)
    
    const rendered_values =
    Render_Search_Schema_Value_Recursive(
        schema,
        row,
        [],
        0
        )
        
        rendered_values.forEach(rendered => {
            rendered.input.addEventListener(
            'input',
            () => {
                filter.values =
                    rendered_values.map(item => ({
                        schema: item.schema,
                        value: item.input.value
                    }))
            }
        )
    })
    row.appendChild(field_operator_select)


    container.appendChild(row)
}
function Get_Operators_For_Schema(
    schema: Schema
): Filter_Operator[] {

    if (schema.data_type === 'Number') {
        return [
            'equals',
            'greater_than',
            'less_than',
            'has_field'
        ]
    }

    if (schema.data_type === 'String') {
        return [
            'equals',
            'contains',
            'has_field'
        ]
    }

    if (
        schema.data_type === 'Interface' ||
        schema.data_type === 'Associative_Array'
    ) {
        return [
            'has_element',
            'has_property',
            'has_field'
        ]
    }

    return [
        'equals',
        'has_field'
    ]
}
export async function Make_Searchable_Select(
    schemas: Schema[],
    container: HTMLDivElement,
    select_label: string,
    search_query_state: Search_Query
): Promise<HTMLSelectElement> {
   

    const search_input = document.createElement('input');
    search_input.type = 'text';
    search_input.placeholder = 'Search...';
    const select = document.createElement('select');
    select.size = 10;
    // container.style.display = 'flex'
    // container.style.flexDirection = 'row'
    const select_label_element: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    select_label_element.textContent = select_label

    search_input.addEventListener('input', () => {
        select.style.display = '';
        Render_Options_Schema(
            schemas,
            select,
            search_input.value
        );
    });
    search_input.addEventListener('click', () => {
        select.style.display = ''
        Render_Options_Schema(
            schemas,
            select,
            search_input.value
        );
    })

   
    select.addEventListener('input', function() {
       
        select.style.display = 'none';
        const Selected_Option = select.options[select.selectedIndex];
        const schema: Schema = JSON.parse(Selected_Option.dataset.schema!)
        select.style.display = 'none';
        // const label = document.createElement('p')
        // label.textContent = schema.name
        // const div = document.createElement('div')
        // div.style.display = 'flex'
        // div.style.flexDirection = 'row'
        // div.style.gap = '3px'
        // div.appendChild(label)
    //     const rendered_values = Render_Search_Schema_Value_Recursive(
    //     schema,
    //     div,
    //     [],
    //     0
    // )
        /**
         * if field operator vary according to data type, differinate them
         * 
        */
      
        
        search_input.style.display = 'none';
        Add_Search_Filter_Row(
        schema,
        container,
        search_query_state
        )
        console.log(`state ${JSON.stringify(search_query_state)}`)
    })
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // If click is outside both the input and the select, hide the select
        if (target !== search_input && !select.contains(target)) {
            select.style.display = 'none';
        }
    });
    container.appendChild(select_label_element)
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
import type { Search_Target } from "$lib/Schema/models";
import { Create_Options_In_Select_From_Array } from "$lib/utils";
    onMount(() => {
      if (browser) {
            const new_schema_button: HTMLButtonElement = document.getElementById('new_schema_button') as HTMLButtonElement

            Make_Button_Goto_URL(new_schema_button, 'Schema/Definition')
        }
            const Search_Targets = ['schemas', 'instances', 'activity']
            const Search_Target: HTMLSelectElement = document.getElementById('Search_Target') as HTMLSelectElement
            Create_Options_In_Select_From_Array(Search_Target, Search_Targets)
            const facted_search_container: HTMLDivElement = document.getElementById('faceted_search') as HTMLDivElement
            const search_query_state: Search_Query = $state({'target': 'schemas'})
            Handle_Search_Target_Select(Search_Target, facted_search_container, search_query_state)
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
    .faceted_search {
        overflow-y: scroll;
    }
</style>