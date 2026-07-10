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
        <!-- <button id="create_new_schema">Create New Schema</button> -->
    </div>
    <div id="center_column_2nd_row">
        <div id="identifier_div">
            <p id="identifier_label">
                Identifiers
            </p>
            <div id="sub_identifier_div"> 
                <button id="identifier_button" >
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
    <button> Save Schema</button>
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
import type { Schema, Schema_Association, Data_Type } from "$lib/Schema/models";
import { Get_Schema_By_UID } from "$lib/graphql/utils";
import { Get_All_Schemas, Convert_GraphQL_Schema_To_Schema } from "$lib/utils";
import { PUBLIC_SERVER_API_URL } from "$env/static/public";
import {Handle_Create_New_Schema, Link_Element_to_State, Make_Collapsible, Make_Searchable_Select_Schema, Handle_Data_Type_Select, Create_Options_In_Select_From_Array, Make_Searchable_Select } from "$lib/utils";
import { page } from '$app/state';
function Resolve_Schema_In_Elements(
    schema: Schema,
    name_input: HTMLInputElement,
    data_type_select: HTMLSelectElement) {

        name_input.value = schema.name
        data_type_select.value = schema.data_type

    }
  onMount(async () => {
      if (browser) {
            const state: Schema = $state({'name': '', 'data_type': 'Interface'})
            const schema_uid: string | undefined = page.params.uid
            if (!schema_uid) {
                /**prompt user to create schema*/
            }
            console.log(`schema uid ${schema_uid}`)
            const graphql_schema = await Get_Schema_By_UID(
                PUBLIC_SERVER_API_URL, 
                schema_uid!, localStorage.getItem('token') ?? undefined
            )
            const schema = Convert_GraphQL_Schema_To_Schema(graphql_schema!)
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
            Handle_Data_Type_Select(Data_Type_Select,
                [], first_row_center_column,
                constraint_container, state
            )
            
            Make_Collapsible(constraint_label!, constraint_container)
            const center_column_2nd_row: HTMLDivElement = document.getElementById('center_column_2nd_row') as HTMLDivElement
            const identifier_div: HTMLDivElement = document.getElementById('sub_identifier_div') as HTMLDivElement

            const Identifiers_Button: HTMLButtonElement = document.getElementById('identifier_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(Identifiers_Button, schemas, identifier_div, state, 'identifiers')
            const sub_property_div: HTMLDivElement = document.getElementById('sub_property_div') as HTMLDivElement
            const property_button: HTMLButtonElement = document.getElementById('property_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(property_button, 
                schemas,
                sub_property_div, state, 'properties')
            const property_label = document.getElementById('property_label')
            Make_Collapsible(property_label!, sub_property_div)
            const identifier_label = document.getElementById('identifier_label')
            Make_Collapsible(identifier_label!, identifier_div)
            const Schema_Name_Input: HTMLInputElement = document.getElementById('Schema_Name_Input') as HTMLInputElement
            Link_Element_to_State(state, 'name', Schema_Name_Input)
            Resolve_Schema_In_Elements(schema,
                Schema_Name_Input,
                Data_Type_Select
            )
        }
    });
</script>