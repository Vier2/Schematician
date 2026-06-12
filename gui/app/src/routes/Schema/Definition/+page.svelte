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
import type { Schema, Schema_Association, Data_Type } from "$lib/Schema/models";
import {Handle_Create_New_Schema, Link_Element_to_State, Make_Collapsible, Make_Searchable_Select_Schema, Handle_Data_Type_Select, Create_Options_In_Select_From_Array, Make_Searchable_Select } from "$lib/utils";
  onMount(() => {
      if (browser) {
            const state: Schema = $state({'name': '', 'data_type': 'Interface'})
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


            const types: Data_Type[] = [
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
                'Coordinating Conjunction',
                "Throttle Body Identifier", 
                "Valve Angle", "Airflow Rate", "Throttle Body Properties", "Throttle Body", "Intake System Identifier", "Intake System", "Engine Identifier", "Engine", "Electric Motor Idenitifier", "Electric Motor", "Transmission Identifier", "Drive Shaft Identifier", "Differential Identifier", "Drive Shaft", "Transmission", "Chassis", "Differential", "Tire", "Throttle Command Identifier", "Throttle Command", "Pedal Effort Identifier", "Pedal Effort", "Pad Properties", "Pad", "Pedal", "Axle Identifier", "PRNDL", "Gear Selector Properties", "Gear Selector", "Axle", "Powertrain", "Road Vehicle Definition", "Road Vehicle Identifiers", "Ground", "Road Vehicle"
            ]
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
                [Engine], first_row_center_column,
                constraint_container, state
            )
            
            Make_Collapsible(constraint_label!, constraint_container)
            const center_column_2nd_row: HTMLDivElement = document.getElementById('center_column_2nd_row') as HTMLDivElement
            const identifier_div: HTMLDivElement = document.getElementById('sub_identifier_div') as HTMLDivElement

            const Identifiers_Button: HTMLButtonElement = document.getElementById('identifier_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(Identifiers_Button, [Definition], identifier_div, state, 'identifiers')
            const sub_property_div: HTMLDivElement = document.getElementById('sub_property_div') as HTMLDivElement
            const property_button: HTMLButtonElement = document.getElementById('property_button') as HTMLButtonElement
            Make_Searchable_Select_Schema(property_button, [Pedal_Effort,
                PRNDL, Valve_Angle,
            Airflow_Rate, ], sub_property_div, state, 'properties')
            const property_label = document.getElementById('property_label')
            Make_Collapsible(property_label!, sub_property_div)
            const identifier_label = document.getElementById('identifier_label')
            Make_Collapsible(identifier_label!, identifier_div)
            const Schema_Name_Input: HTMLInputElement = document.getElementById('Schema_Name_Input') as HTMLInputElement
            Link_Element_to_State(state, 'name', Schema_Name_Input)
        }
    });
</script>