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
import { Add_Hierarchical_Elements, Apply_Descending_Indentation, Render_Schema_MetaData, Apply_Incremental_CSS_To_Children, Add_Header_For_Each_KeyValue, Add_Event_Map_Elements } from "$lib/utils";
import type { Schema, Schema_Association, Schema_Instance } from "$lib/Schema/models";
    onMount(() => {
        if (browser) {
            const Definition: Schema = {'name': 'Definition', 'data_type': 'String'}
const Throttle_Body_Identifier: Schema_Association[] = [{'schema': Definition,
                'value': `valve in an engine's air intake system that regulates the volume
                of air entering the combustion chamber. `
            }]
            const Valve_Angle: Schema = {'name': 'Valve Angle', 'data_type': 'Number'
            }
            const Airflow_Rate: Schema = {'name': 'Airflow Rate', 'data_type': 'Number'
            }

            const Throttle_Body_Properties: Schema_Association[] = [{
                'schema': Valve_Angle,
                'value': 0,

            }
            ,
            {
                'schema': Airflow_Rate,
                'value': 0
            }
            ]
            const Throttle_Body: Schema = {'name': 'Throttle Body', 
                'data_type': 'Interface',
                'identifiers': Throttle_Body_Identifier,
                'properties': Throttle_Body_Properties
            }
           const Intake_System_Identifier: Schema_Association[] = [{'schema': Definition,
                'value': `a collection of components responsible for pulling in, filtering, 
                measuring, and distrubing the exact amount of air required to mix with 
                fuel combustion`
            }]
            const Intake_System: Schema = {'name': 'Intake System', 
                'data_type': 'Interface',
                'elements': [Throttle_Body],
                'identifiers': Intake_System_Identifier

            }
            const Engine_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `a machine designed 
                to convert one or more forms of enery into mechanical force 
                and motion`}]
            const Engine: Schema = {'name': 'Engine', 'data_type': 'Interface', 
                'identifiers': Engine_Identifier,
                'elements': [Intake_System]
            }
            const Electric_Motor_Idenitifier: Schema_Association[] = [{'schema': Definition, 'value': `
                an electromechanical device that converts electrical energy into mechanical energy, typically generating
                rotational motion`}]
            const Electric_Motor: Schema = {'name': 'Electric Motor', 'data_type': 'Interface', 'identifiers': Electric_Motor_Idenitifier}
            const Transmission_Identifier: Schema_Association[] = [{'schema': Definition, 
                'value': `a mechanical or electromechanical system that transfers power
                from the engine or motor to the drive wheels  `
            }]
            const Drive_Shaft_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `
                a precision - balanced mechanical component that transmits torque and rotary motion 
                between drivetrain components, usually connecting the transmission or transfer case to the differential. 
                `}]
            const Differential_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `
                a mechanical drivetrain component that splits the engine's power in two and 
                delivers it to the wheels, allowing each wheel to rotate at different speeds`}]
            const Drive_Shaft: Schema = {'name': 'Drive Shaft', 'data_type': 'Interface', identifiers: Drive_Shaft_Identifier}
            const Transmission: Schema = {'name': 'Transmission', 'data_type': 'Interface', 'identifiers': Transmission_Identifier}
            const Chassis: Schema = {'name': 'Chassis', 'data_type': 'Interface'}/**Frame, suspension, steering, brakes, wheels, tires */
            const Differential: Schema = {'name':  'Differential', 'data_type': 'Interface', 'identifiers': Differential_Identifier
                
            }
            const Tire: Schema = {'name': 'Tire', data_type: 'Interface'}
            const Throttle_Command_Identifier: Schema_Association[] = [{'schema': Definition,
                'value': `The electronic or mechanical signal that tells the engine
                how much air and fuel to take in`
            }]
            const Throttle_Command: Schema = {'name': 'Throttle Command', 'identifiers': Throttle_Command_Identifier,
                'data_type': 'Interface'
            }
            const Pedal_Effort_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `The mechanical input 
                applied by the driver required to engage the accelerator, clutch, or brakes`}]
            const Pedal_Effort: Schema = {'name': "Pedal Effort", data_type: 'Number', 'identifiers': Pedal_Effort_Identifier}
            const Pad_Properties: Schema_Association[] = [{'schema': Pedal_Effort, 'value': 0}]


            /**
             * Options:
             *  1. Pedal effort signals throttle position sensor to open air valve in which component
             * 2. Pedal effort command engine computer to inject fuel
             */
            const Pad: Schema = {'name': 'Pad', 'data_type': 'Interface', 'properties': Pad_Properties}
            const Pedal: Schema = {'name': ' Pedal', 'data_type': "Interface", 'elements': [Pad]}

            const Axle_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `
                A central rod or shaft that connects a pair of wheels `}]
            const PRNDL: Schema = {'name': 'PRNDL', 'data_type': 'String', 'enumerations': ['Park', 
                'Reverse', 'Neutral', 'Drive', 'Low'
            ]}
            const Gear_Selector_Properties: Schema_Association[] =[{'schema': PRNDL, value: 'Park'}]
            const Gear_Selector: Schema = {'name': 'Gear Selector', 'data_type': 'Interface', properties: Gear_Selector_Properties}
            const Axle: Schema = {'name': 'Axle', 'data_type': 'Interface', 'identifiers': Axle_Identifier}
            const Powertrain: Schema = { 'name': 'Powertrain', 'data_type': 'Interface', 'elements': [Electric_Motor, Engine, Transmission, 
                Drive_Shaft, Differential, Axle, Gear_Selector, Pedal] } /**Engine, Electric Motor, transmission, driveshaft, differential, axle */
            const Road_Vehicle_Definition = `Any self propelled 
            or tracked machine designed primarily to transport people, animals, or goods
            on public roads and highways`

            const Road_Vehicle_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': Road_Vehicle_Definition}]
            const Ground: Schema = {'name': 'Ground', 'data_type': 'Interface'}                       
            const Road_Vehicle: Schema = {"name": 'Road Vehicle', 'data_type': 'Interface', 
                                        'elements': [Powertrain,  Chassis], 'identifiers': Road_Vehicle_Identifiers}

            const Hierarchical_Path_Div: HTMLDivElement = document.getElementById('Hierarchical_Path_Div') as HTMLDivElement;
            Apply_Descending_Indentation(Hierarchical_Path_Div, 42)
            Apply_Incremental_CSS_To_Children(Hierarchical_Path_Div, 'fontSize', 15, 'px')
            const Independent_Clause_Identifier: Schema_Association[] = [{'schema': Definition, 
                'value': ` a group of words that contains both a subject and a verb and expresses a complete thought`
            }]
            const Independent_Clause: Schema = {'name': 'Independent Clause', 
                'data_type': 'String',
                'identifiers': Independent_Clause_Identifier}
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

            const Current_Instance_Div: HTMLDivElement = document.getElementById('Current_Instance_Div') as HTMLDivElement

            const Current_Schema_Div: HTMLDivElement = document.getElementById('Current_Schema_Div') as HTMLDivElement
            Render_Schema_MetaData(Road_Vehicle, Current_Schema_Div)
            const Map_Div: HTMLDivElement = document.getElementById('Map_Div') as HTMLDivElement
            const list = Add_Hierarchical_Elements(Map_Div, Road_Vehicle)
            const previous_button: HTMLButtonElement = document.getElementById('Previous_Element_Button') as HTMLButtonElement
            const next_button: HTMLButtonElement = document.getElementById('Next_Element_Button') as HTMLButtonElement
            const state: Schema_Instance = $state({'schema': Road_Vehicle,
                'root': {}
            })
            Add_Event_Map_Elements(
                Current_Schema_Div, list, previous_button, 
                next_button, Current_Instance_Div,
            state)
        }
    });
</script>