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
        <div id="Current_Instance_Div"></div>
        <div id="Current_Instance_MetaData_Div"> </div>
    </div>
    <div class="Right_Column">
        <div id="Map_Div"></div>
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
        grid-template-rows: 20% 40% 20%
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
 
</style>

<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/environment";
import { Add_Hierarchical_Elements, Apply_Descending_Indentation, Render_Schema_MetaData, Apply_Incremental_CSS_To_Children, Add_Header_For_Each_KeyValue } from "$lib/utils";
import type { Schema, Schema_Association } from "$lib/Schema/models";
    onMount(() => {
        if (browser) {
            const Definition: Schema = {'name': 'Definition', 'data_type': 'String'}

            const Hierarchical_Path_Div: HTMLDivElement = document.getElementById('Hierarchical_Path_Div') as HTMLDivElement;
            Apply_Descending_Indentation(Hierarchical_Path_Div, 42)
            Apply_Incremental_CSS_To_Children(Hierarchical_Path_Div, 'fontSize', 15, 'px')
            const Independent_Clause: Schema = {'name': 'Independent Clause', 'data_type': 'String'}
            const Dependent_Clause: Schema = {'name': 'Independent Clause', 'data_type': 'String'}

            const Subordinating_Conjunction: Schema = {'name': 'Subordinating Conjunction', 'data_type': `String`}
            const Complex_Sentence_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': `
             a sentence that combines one independent clause with at least one dependent clause`}]
            const Complex_Sentence: Schema = {'name': 'Complex Sentence', 'data_type': 'Interface', 
                'elements': [Independent_Clause, 
                Subordinating_Conjunction,
                Dependent_Clause],
                'identifiers': Complex_Sentence_Identifiers
            }


            const Current_Schema_Div: HTMLDivElement = document.getElementById('Current_Schema_Div') as HTMLDivElement
            Render_Schema_MetaData(Complex_Sentence, Current_Schema_Div)
            const Map_Div: HTMLDivElement = document.getElementById('Map_Div') as HTMLDivElement
            Add_Hierarchical_Elements(Map_Div, Complex_Sentence)

        }
    });
</script>