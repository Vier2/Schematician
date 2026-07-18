import type { Schema } from "./schema/schema";
import type { Schema_Association } from "./schema/schema";

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
    'data_type': 'composite',
    'identifiers': Throttle_Body_Identifier,
    'properties': Throttle_Body_Properties
}
const Intake_System_Identifier: Schema_Association[] = [{'schema': Definition,
    'value': `a collection of components responsible for pulling in, filtering, 
    measuring, and distrubing the exact amount of air required to mix with 
    fuel combustion`
}]
const Intake_System: Schema = {'name': 'Intake System', 
    'data_type': 'composite',
    'elements': [Throttle_Body],
    'identifiers': Intake_System_Identifier

}
const Engine_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `a machine designed 
    to convert one or more forms of enery into mechanical force 
    and motion`}]
const Engine: Schema = {'name': 'Engine', 'data_type': 'composite', 
    'identifiers': Engine_Identifier,
    'elements': [Intake_System]
}
const Electric_Motor_Idenitifier: Schema_Association[] = [{'schema': Definition, 'value': `
    an electromechanical device that converts electrical energy into mechanical energy, typically generating
    rotational motion`}]
const Electric_Motor: Schema = {'name': 'Electric Motor', 'data_type': 'composite', 'identifiers': Electric_Motor_Idenitifier}
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
const Drive_Shaft: Schema = {'name': 'Drive Shaft', 'data_type': 'composite', identifiers: Drive_Shaft_Identifier}
const Transmission: Schema = {'name': 'Transmission', 'data_type': 'composite', 'identifiers': Transmission_Identifier}
const Chassis: Schema = {'name': 'Chassis', 'data_type': 'composite'}/**Frame, suspension, steering, brakes, wheels, tires */
const Differential: Schema = {'name':  'Differential', 'data_type': 'composite', 'identifiers': Differential_Identifier
    
}
const Tire: Schema = {'name': 'Tire', data_type: 'composite'}
const Throttle_Command_Identifier: Schema_Association[] = [{'schema': Definition,
    'value': `The electronic or mechanical signal that tells the engine
    how much air and fuel to take in`
}]
const Throttle_Command: Schema = {'name': 'Throttle Command', 'identifiers': Throttle_Command_Identifier,
    'data_type': 'composite'
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
const Pad: Schema = {'name': 'Pad', 'data_type': 'composite', 'properties': Pad_Properties}
const Pedal: Schema = {'name': ' Pedal', 'data_type': "composite", 'elements': [Pad]}

const Axle_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `
    A central rod or shaft that connects a pair of wheels `}]
const PRNDL: Schema = {'name': 'PRNDL', 'data_type': 'String', 'enumerations': ['Park', 
    'Reverse', 'Neutral', 'Drive', 'Low'
]}
const Gear_Selector_Properties: Schema_Association[] =[{'schema': PRNDL, value: 'Park'}]
const Gear_Selector: Schema = {'name': 'Gear Selector', 'data_type': 'composite', properties: Gear_Selector_Properties}
const Axle: Schema = {'name': 'Axle', 'data_type': 'composite', 'identifiers': Axle_Identifier}
const Powertrain: Schema = { 'name': 'Powertrain', 'data_type': 'composite', 'elements': [Electric_Motor, Engine, Transmission, 
    Drive_Shaft, Differential, Axle, Gear_Selector, Pedal] } /**Engine, Electric Motor, transmission, driveshaft, differential, axle */
const Road_Vehicle_Definition = `Any self propelled 
or tracked machine designed primarily to transport people, animals, or goods
on public roads and highways`

const Road_Vehicle_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': Road_Vehicle_Definition}]
const Ground: Schema = {'name': 'Ground', 'data_type': 'composite'}                       
const Road_Vehicle: Schema = {"name": 'Road Vehicle', 'data_type': 'composite', 
                            'elements': [Powertrain,  Chassis], 'identifiers': Road_Vehicle_Identifiers}


/*Goal:
1. Create Schema to represent a Road Vehicle, and instances of Road Vehicles: Rav4, Lexus NX */ 