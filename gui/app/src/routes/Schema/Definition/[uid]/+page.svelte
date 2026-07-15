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
        <div id="element_div">
            <p id="element_label">
                Elements
            </p>
            <div id="sub_element_div">
                <button id="search_element_button">
                    <img src={Search_Icon} alt="search icon" height="12px">
                </button>
                <button id="create_element_button">
                    +
                </button>
            </div>
        </div>
        <div id="identifier_div">
            <p id="identifier_label">
                Identifiers
            </p>
            <div id="sub_identifier_div"> 
                <button id="identifier_button" >
                    <img src={Search_Icon} alt="search icon" height="12px">
                </button>
                 <button id="create_identifier_button" >
                     +
                </button>
            </div>

        </div>
        <div id="property_div"></div>
            <p id="property_label">
                Properties
            </p>
                <div id="sub_property_div"> 
                    <button id="property_button" >
                        <img src={Search_Icon} alt="search icon" height="12px">
                    </button>
                    <button id="create_property_button">
                        +
                    </button>
                </div>
        <div> 
            <p id="Constraint_Label"> Constraints</p>
            <div id="sub_constraint_div">

            </div>
        </div>
    </div>
</div>
<div id="right_column">
    <button id="save_schema"> Save Schema</button>
    <button id="instantiate_schema"> Instantiate Schema</button>
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
    .sub_container {
        display: grid;
        grid-template-rows: 1fr 1fr;
    }
</style>

<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import type { Schema, Schema_Association, Data_Type, Selection, Association } from "$lib/Schema/models";
import { Get_Schema_By_UID } from "$lib/graphql/utils";
import { Get_All_Schemas, Convert_GraphQL_Schema_To_Schema, Create_Schema_Element } from "$lib/utils";
import { PUBLIC_CLIENT_API_URL, PUBLIC_SERVER_API_URL } from "$env/static/public";
import { Link_Element_to_State, Add_Schema_Modal_Association, Add_Schema_Modal_Element, Render_Schema_Option, Make_Collapsible, Make_Searchable_Select_Schema, Handle_Data_Type_Select, Create_Options_In_Select_From_Array, Make_Searchable_Select } from "$lib/utils";
import { page } from '$app/state';
import { Send_GraphQL_Request, Convert_Schema_To_Update_Data, Create_Instantiate_Button } from "$lib/graphql/utils";
import type { Update_Schema_Response, Update_Schema_Data } from "$lib/graphql/types";
import Search_Icon from '$lib/assets/search.png'

/**
 * use for properties, identifiers, elements
 * @param state: schema
 * @param association: properties with its container and select
 */
function Resolve_Schema_Association(
    state: Schema,
    association: Association
) {
    association.schema_association?.forEach(element => {
        /**dont add to state here because data is already in the state*/
        const input_viewer = Render_Schema_Option(
            association.select,
            association.div,
            element.schema,
            association.selection, state
        )
        input_viewer.input.value = `${element.value}`
        input_viewer.viewer.textContent = input_viewer.input.value
        /**make url to edit schema*/
    });
}
function Resolve_Elements() {

}
function Resolve_Schema_In_Elements(
    schema: Schema,
    name_input: HTMLInputElement,
    data_type_select: HTMLSelectElement,
    element_container: HTMLDivElement,
    associations?: Association[],
    ) {
        name_input.value = schema.name
        data_type_select.value = schema.data_type
        console.log(`associations ${JSON.stringify(associations)}`)
        associations?.forEach(element => {
            Resolve_Schema_Association(
                schema,
                element
            )
        });
        schema.elements?.forEach(element => {
            Create_Schema_Element(
                element,
                schema,
                element_container,
                PUBLIC_CLIENT_API_URL
            )
        });

    }
  onMount(async () => {
      if (browser) {
            const schema_uid: string | undefined = page.params.uid
            if (!schema_uid) {
                /**prompt user to create schema*/
            }
            console.log(`schema uid ${schema_uid}`)
            const graphql_schema = await Get_Schema_By_UID(
                PUBLIC_SERVER_API_URL, 
                schema_uid!, 5, localStorage.getItem('token') ?? undefined
            )
            const schema = Convert_GraphQL_Schema_To_Schema(graphql_schema!)
            let state = schema
            console.log(`schema ${JSON.stringify(schema)}`)
            const types: Data_Type[] = [
                'String',
                'Number',
                'Boolean',
                'Interface',
                'Associative_Array'
            ]
            const graphql_schemas = await Get_All_Schemas(PUBLIC_SERVER_API_URL)
            const schemas: Schema[] = graphql_schemas.map(Convert_GraphQL_Schema_To_Schema) 
            
            const Data_Type_Select: HTMLSelectElement = document.getElementById('Data_Type_Select') as HTMLSelectElement
            const center_column: HTMLDivElement = document.getElementById('center_column') as HTMLDivElement
            const first_row_center_column: HTMLDivElement = document.getElementById('center_column_1st_row') as HTMLDivElement
            Create_Options_In_Select_From_Array(Data_Type_Select,
                types
            )
            Link_Element_to_State(state, 'data_type', Data_Type_Select)
            const constraint_label = document.getElementById('Constraint_Label')
            const constraint_container: HTMLDivElement = document.getElementById('sub_constraint_div') as HTMLDivElement
            
            await Handle_Data_Type_Select(Data_Type_Select,
                [], first_row_center_column,
                constraint_container, state, PUBLIC_CLIENT_API_URL
            )
            
            Make_Collapsible(constraint_label!, constraint_container)
            const center_column_2nd_row: HTMLDivElement = document.getElementById('center_column_2nd_row') as HTMLDivElement
            const sub_identifier_div: HTMLDivElement = document.getElementById('sub_identifier_div') as HTMLDivElement
            const instantiate_button: HTMLButtonElement = document.getElementById('instantiate_schema') as HTMLButtonElement
            Create_Instantiate_Button(
                instantiate_button,
                PUBLIC_SERVER_API_URL, 
                state.uid!
            )

            const Identifiers_Button: HTMLButtonElement = document.getElementById('identifier_button') as HTMLButtonElement
            
            const identifier_search_select:HTMLSelectElement = document.createElement('select') as HTMLSelectElement
            Make_Searchable_Select_Schema(Identifiers_Button, schemas, sub_identifier_div, state, 'identifiers', identifier_search_select)
            const sub_property_div: HTMLDivElement = document.getElementById('sub_property_div') as HTMLDivElement
            const property_button: HTMLButtonElement = document.getElementById('property_button') as HTMLButtonElement
            const property_search_select:HTMLSelectElement = document.createElement('select') as HTMLSelectElement
            Make_Searchable_Select_Schema(property_button, 
                schemas,
                sub_property_div, state, 'properties',
                property_search_select)
            const property_label = document.getElementById('property_label')
            Make_Collapsible(property_label!, sub_property_div)
            const identifier_label = document.getElementById('identifier_label')
            Make_Collapsible(identifier_label!, sub_identifier_div)
            const Schema_Name_Input: HTMLInputElement = document.getElementById('Schema_Name_Input') as HTMLInputElement
            Link_Element_to_State(state, 'name', Schema_Name_Input)
            const sub_element_div: HTMLDivElement = document.getElementById('sub_element_div') as HTMLDivElement
            const search_element_button: HTMLButtonElement = document.getElementById('search_element_button') as HTMLButtonElement
            const element_label = document.getElementById('element_label')
            Make_Collapsible(element_label!, sub_element_div)
            const element_search_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
            Make_Searchable_Select(
                search_element_button,
                schemas,
                sub_element_div,
                state,
                PUBLIC_CLIENT_API_URL,
                element_search_select
            )
            Resolve_Schema_In_Elements(
                schema,
                Schema_Name_Input,
                Data_Type_Select,
                sub_element_div,
                [{'div': sub_identifier_div, 'select': identifier_search_select, 'selection': 'identifiers', 'schema_association': state.identifiers},
                    {'div': sub_property_div, 'select': property_search_select, 'schema_association': state.properties, 'selection': 'properties'}
                ]
            )
            const create_element_button: HTMLButtonElement = document.getElementById('create_element_button') as HTMLButtonElement
            Add_Schema_Modal_Element(
                create_element_button,
                PUBLIC_SERVER_API_URL,
                PUBLIC_CLIENT_API_URL,
                sub_element_div,
                state
            )
            const create_property_button: HTMLButtonElement = document.getElementById('create_property_button') as HTMLButtonElement
            const create_identifier_button: HTMLButtonElement = document.getElementById('create_identifier_button') as HTMLButtonElement
            Add_Schema_Modal_Association(
                create_property_button,
                PUBLIC_SERVER_API_URL,
                'properties',
                sub_property_div,
                state,
                property_search_select
            )
            Add_Schema_Modal_Association(
                create_identifier_button,
                PUBLIC_SERVER_API_URL,
                'identifiers',
                sub_identifier_div,
                state,
                identifier_search_select
            )

            const save_schema: HTMLButtonElement = document.getElementById('save_schema') as HTMLButtonElement

            save_schema.addEventListener('click', async function() {
                /***/
                
             const update_data = Convert_Schema_To_Update_Data(state)

            const result =
                await Send_GraphQL_Request<
                    Update_Schema_Response,
                    {
                        schema: Update_Schema_Data
                    }
                >({
                    api_url: PUBLIC_SERVER_API_URL,

                    operation_type: 'mutation',

                    operation_name: 'Update_Schema',

                    field_name: 'update_schema',

                    variables: [
                        {
                            name: 'schema',
                            type: 'Update_Schema_Input!'
                        }
                    ],

                    input_data: {
                        schema: update_data
                    },

                    selection: [
                        'uid',
                        'name',
                        'data_type',
                        'image',
                        'rules',
                        'logic',
                        'relationships',
                        'enumerations',
                        'options',

                        {
                            field: 'elements',
                            selection: [
                                'uid',
                                'name',
                                'data_type'
                            ]
                        },

                        {
                            field: 'properties',
                            selection: [
                                'value',
                                {
                                    field: 'schema',
                                    selection: [
                                        'uid',
                                        'name',
                                        'data_type'
                                    ]
                                }
                            ]
                        },

                        {
                            field: 'identifiers',
                            selection: [
                                'value',
                                {
                                    field: 'schema',
                                    selection: [
                                        'uid',
                                        'name',
                                        'data_type'
                                    ]
                                }
                            ]
                        }
                    ],

                    token:
                        localStorage.getItem('token') ??
                        undefined
                })

            const updated_schema = result.schema

            console.log('Updated schema:', updated_schema)

                        })
                    }
         
    });
</script>