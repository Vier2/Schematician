<div class="Grid_3_Column">
    <div class="Left_Column">
        <!-- <div></div> -->
        <header id="Schema_App_Mode_Header"> Schema Instantiation</header>
        <div id="Hierarchical_Path_Div">
            <div id="Great_Grand_Parent_Element_Div">
                Great_Grand_Parent_Element_Div
            </div>
            <div id="Grand_Parent_Element_Div">
                Grand_Parent_Element_Div
            </div>
            <div id="Parent_Element_Div" >
                Parent_Element_Div
                <div class="Vertical_Flex_Column" id="Parent_Element_Index_Set">
                    <a class="Font_Size_Large" href="nop">1 </a>
                    <a class="Font_Size_Large" href="nop">2 </a>
                    <a class="Font_Size_Large" href="nop">3 </a>
                

                </div>
            </div>

        </div>
        <button id="Previous_Element_Button"> Previous</button>
    </div>
    <div class="Center_Column">
        <div id="Current_Schema_Div"></div>
        <div id="Current_Instance_Div" class="current_instance_div">
        </div>
        <div id="Current_Instance_MetaData_Div"> </div>
    </div>
    <div class="Right_Column">
        <div id="Map_Div" class="map"></div>
        <button id="Next_Element_Button"> Next</button>
    </div>
    
</div>

<style>
    .Grid_3_Column {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        height: 80vh;
        max-width: 100%;
    }
  
    .map {
        border: 2px solid black;
        overflow-y: scroll;

    }
    .Left_Column {
        /* Hierarchical Path, Schema App Mode, & Previous Element Arrow*/
        height: 100%;
        width: 100%;
        overflow-y: hidden;
        overflow-x: hidden;

    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    }
    .Center_Column {
        /* Schema Meta Data, Schema Value Box, Schema Instant Data */
        display: grid;
        grid-template-rows: 20% 79% 1%;
        gap: 10%
    }
    .Right_Column {
        /* Map & Next Element Arrow */
        display: grid;
        grid-template-rows: 50% 30%

    }
    .Vertical_Flex_Column {
        display: flex;
        flex-direction: column;
    }
  .Font_Size_Large {
    font-size: large;
    margin-left: 350px;
  }
  .current_instance_div {
    display: flex;
    justify-content: center;
    overflow-wrap: break-word;
    flex-direction: column;
    overflow-x: hidden;
  }
 
</style>

<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import { page } from '$app/state';
import { Add_Hierarchical_Elements, Apply_Descending_Indentation, Render_Schema_MetaData, Apply_Incremental_CSS_To_Children, Add_Header_For_Each_KeyValue, Add_Event_Map_Elements, Convert_GraphQL_Schema_To_Schema } from "$lib/utils";
import type { Schema_Instance } from "$lib/Schema/models";
import { Get_Instance_By_UID, Get_Schema_By_UID } from "$lib/graphql/utils";
    import { PUBLIC_SERVER_API_URL } from "$env/static/public";
    onMount( async() => {
        if (browser) {
            
            const Hierarchical_Path_Div: HTMLDivElement = document.getElementById('Hierarchical_Path_Div') as HTMLDivElement;
            Apply_Descending_Indentation(Hierarchical_Path_Div, 42)
            Apply_Incremental_CSS_To_Children(Hierarchical_Path_Div, 'fontSize', 15, 'px')
       

            const Current_Instance_Div: HTMLDivElement = document.getElementById('Current_Instance_Div') as HTMLDivElement
            const Current_Schema_Div: HTMLDivElement = document.getElementById('Current_Schema_Div') as HTMLDivElement
            const instance_uid: string | undefined = page.params.uid
            const instance = await Get_Instance_By_UID(
                PUBLIC_SERVER_API_URL, instance_uid!, 
                localStorage.getItem('token') ?? undefined)
            if (instance_uid) {
                }
            console.log(`schema uid: ${instance?.schema_uid}`)
            const GraphQL_schema = await Get_Schema_By_UID(
                    PUBLIC_SERVER_API_URL, 
                    instance!.schema_uid,
                    localStorage.getItem('token') ?? undefined

                )
            const schema = Convert_GraphQL_Schema_To_Schema(GraphQL_schema!)
            Render_Schema_MetaData(schema!, Current_Schema_Div)
            const Map_Div: HTMLDivElement = document.getElementById('Map_Div') as HTMLDivElement
            const list = Add_Hierarchical_Elements(Map_Div, schema!)
            const previous_button: HTMLButtonElement = document.getElementById('Previous_Element_Button') as HTMLButtonElement
            const next_button: HTMLButtonElement = document.getElementById('Next_Element_Button') as HTMLButtonElement
            const state: Schema_Instance = $state({'schema': schema,
                'root': {}
            })
            Add_Event_Map_Elements(
                Current_Schema_Div, list, previous_button, 
                next_button, Current_Instance_Div,
            state)
        }
    });
</script>