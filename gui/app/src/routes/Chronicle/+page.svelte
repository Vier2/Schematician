<div class="main">
    <div class="header" id="header"> 
        <button id="new_schema_button"> New Schema</button>
        <div id="faceted_search" class="faceted_search"> Faceted Search 
            <select id="Search_Target"> Search Target</select>
            <button id="submit_search"> Search</button>
        </div>
        <button> Settings </button>
    </div>
    <div id="Chronicle" class="chronicle"> 
        <div>

        </div>
        <div>

        </div>
        <div id="results_container" class="results_container">

        </div>
    </div>


</div>

<script lang="ts">
import { Convert_GraphQL_Schema_To_Schema, Get_All_Schemas, Render_Search_Schema_Value_Recursive, Render_Options_Schema } from "$lib/utils";
import type { GraphQL_Response, GraphQl_Instance, GraphQL_Schema} from "$lib/graphql/types";
import { Create_Schema_Modal } from "$lib/utils";
import { Delete_Schema, Create_Instantiate_Button } from "$lib/graphql/utils";
import type { 
    Filter_Operator,
     Search_Schema_Result,
      Search_Result,  
      Search_Instance_Result, Search_Filter_Input, Search_Query_Input, Schema} from "$lib/Schema/models"; 
import { PUBLIC_SERVER_API_URL, PUBLIC_CLIENT_API_URL } from "$env/static/public";
function Handle_Search_Target_Select(select: HTMLSelectElement,
    container: HTMLDivElement,
    search_query_state: Search_Query_Input
) {
    select.value = ''
    select.addEventListener('input', async function() {
        
        search_query_state.search_target = select.value as Search_Target
        const graphql_schemas = await Get_All_Schemas(PUBLIC_SERVER_API_URL)
        const schemas: Schema[] = graphql_schemas.map(Convert_GraphQL_Schema_To_Schema)
        Make_Searchable_Select(schemas, container, 'Field', search_query_state)
        const add_filter_button = document.createElement('button') as HTMLButtonElement
    
    })
}

function Add_Search_Filter_Row(
    schema: Schema,
    container: HTMLDivElement,
    search_query_state: Search_Query_Input
) {
    const filter: Search_Filter_Input = {
        field_schema_uid: schema.uid!,
        operator: 'equals',
        field_role: 'any'
    }

    search_query_state.filters ??= []
    search_query_state.filters.push(filter)

    const row = document.createElement('div')
    const field_roles = ['element', 'property', 'identifier', 'any']
    const field_role_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    /**
     * connect state of field role select, and operator to search_query_state
    */
    container.appendChild(field_role_select)
    Create_Options_In_Select_From_Array(field_role_select, field_roles)
    
    const field_operator = ['equals',
                            'contains',
                            'greater_than',
                            'less_than',
                            'has_field',
                            'has_element',
                            'has_property',
                            'has_identifier']
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
    search_query_state: Search_Query_Input
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

export async function Submit_Search(
    search_query_state: Search_Query_Input,
    api_url: string
): Promise<Search_Result | undefined> {
    if (search_query_state.search_target === 'instances') {
        const query = `
            query Search($query: Search_Query_Input!) {
                search_instances(query: $query) {
                    uid
                    schema_uid
                    objects {
                        field_schema_uid
                        value
                    }
                }
            }
        `

        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
            },
            body: JSON.stringify({
                query,
                variables: { query: search_query_state }
            })
        })

        const result =
            (await response.json()) as GraphQL_Response<{
                search_instances: Search_Instance_Result[]
            }>

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors)
            return
        }

        return {
            search_target: 'instances',
            results: result.data?.search_instances ?? []
        }
    }

    const query = `
        query Search($query: Search_Query_Input!) {
            search_schemas(query: $query) {
                uid
                name
                data_type
            }
        }
    `

    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
        },
        body: JSON.stringify({
            query,
            variables: { query: search_query_state }
        })
    })

    const result =
        (await response.json()) as GraphQL_Response<{
            search_schemas: Search_Schema_Result[]
        }>

    if (result.errors) {
        console.error('GraphQL Errors:', result.errors)
        return
    }

    return {
        search_target: 'schemas',
        results: result.data?.search_schemas ?? []
    }
}

export function Handle_Submit_Search(
    button: HTMLButtonElement,
    search_query_state: Search_Query_Input,
    api_url: string, 
    results_container: HTMLDivElement,
    client_url: string
) {
    button.addEventListener('click', async function () {
        console.log(`search query state ${JSON.stringify(search_query_state)}`)
        const search_result = await Submit_Search(search_query_state, api_url)
        if (search_result?.search_target == "schemas") {
            search_result.results.forEach(schema => {
                const schema_container = Render_Schema_Result(schema, client_url, api_url)
                results_container.appendChild(schema_container)
            });
        }
    })
}
/**Type Cast the Results
 * 
*/

function Render_Schema_Result(
    schema: GraphQL_Schema,
    client_url: string,
    api_url: string) {
    const container = document.createElement('div')
    container.style.border = '2px solid black'
    const name = document.createElement('p')
    name.textContent = schema.name

    const data_type = document.createElement('p')
    data_type.textContent = schema.data_type

    const edit_url: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    edit_url.href = `${client_url}/Schema/Definition/${schema.uid}` /**TODO:Add id dir later*/
    edit_url.textContent = 'Edit'
    /**TODO:Add Delete Button*/
    const delete_button = document.createElement('button')
    delete_button.textContent = 'x'
    delete_button.addEventListener('click', async function() {
        await Delete_Schema(
            api_url,
            schema.uid,
            localStorage.getItem('token') ?? undefined
        )
        container.remove()
    }
    )
    const button:HTMLButtonElement = document.createElement('button')
    const instantiate_button = Create_Instantiate_Button(
        button,
        api_url, schema.uid)
    instantiate_button.textContent = 'instantiate'
    container.appendChild(name)
    container.appendChild(data_type)
    container.appendChild(edit_url)
    container.appendChild(delete_button)
    container.appendChild(instantiate_button)
    return container
}


import { onMount } from "svelte";
import { browser } from "$app/environment";
import type { Search_Target } from "$lib/Schema/models";
import { Create_Options_In_Select_From_Array } from "$lib/utils";
    onMount(() => {
      if (browser) {
            const new_schema_button: HTMLButtonElement = document.getElementById('new_schema_button') as HTMLButtonElement
            new_schema_button.addEventListener('click', function() {
                Create_Schema_Modal(
                    PUBLIC_SERVER_API_URL
                )
            })
            // Make_Button_Goto_URL(new_schema_button, 'Schema/Definition')
        }
            const Search_Targets = ['schemas', 'instances', 'activity']
            const Search_Target: HTMLSelectElement = document.getElementById('Search_Target') as HTMLSelectElement
            Create_Options_In_Select_From_Array(Search_Target, Search_Targets)
            const facted_search_container: HTMLDivElement = document.getElementById('faceted_search') as HTMLDivElement
            const search_query_state: Search_Query_Input = $state({'search_target': 'schemas'})
            Handle_Search_Target_Select(Search_Target, facted_search_container, search_query_state)
            const submit_search_button: HTMLButtonElement = document.getElementById('submit_search') as HTMLButtonElement
            const results_container: HTMLDivElement = document.getElementById('results_container') as HTMLDivElement
            Handle_Submit_Search
            (submit_search_button, 
            search_query_state, 
            PUBLIC_SERVER_API_URL,
            results_container,
            PUBLIC_CLIENT_API_URL,
         )
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
    .results_container {
        overflow-y: scroll;
    }

    .chronicle {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
</style>