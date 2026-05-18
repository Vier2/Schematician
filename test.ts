import type { Schema } from "./schema/schema";
import type { Schema_Association } from "./schema/schema";

const Definition: Schema = {'name': 'Definition', 'data_type': 'String'}


const Engine_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `a machine designed 
    to convert one or more forms of enery into mechanical force 
    and motion`}]
const Engine: Schema = {'name': 'Engine', 'data_type': 'Interface', 'identifiers': Engine_Identifier}
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
const Axle_Identifier: Schema_Association[] = [{'schema': Definition, 'value': `
    A central rod or shaft that connects a pair of wheels `}]
const PRNDL: Schema = {'name': 'PRNDL', 'data_type': 'String', 'enumerations': ['Park', 
    'Reverse', 'Neutral', 'Drive', 'Low'
]}
const Gear_Selector_Properties: Schema_Association[] =[{'schema': PRNDL, value: 'Park'}]
const Gear_Selector: Schema = {'name': 'Gear Selector', 'data_type': 'Interface', properties: Gear_Selector_Properties}
const Axle: Schema = {'name': 'Axle', 'data_type': 'Interface', 'identifiers': Axle_Identifier}
const Powertrain: Schema = { 'name': 'Powertrain', 'data_type': 'Interface', 'elements': [Electric_Motor, Engine, Transmission, 
    Drive_Shaft, Differential, Axle, Gear_Selector] } /**Engine, Electric Motor, transmission, driveshaft, differential, axle */
const Road_Vehicle_Definition = `Any self propelled 
or tracked machine designed primarily to transport people, animals, or goods
on public roads and highways`

const Road_Vehicle_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': Road_Vehicle_Definition}]
                                 
const Road_Vehicle: Schema = {"name": 'Road Vehicle', 'data_type': 'Interface', 
                            'elements': [Powertrain,  Chassis], 'identifiers': Road_Vehicle_Identifiers}


/*Goal:
1. Create Schema to represent a Road Vehicle, and instances of Road Vehicles: Rav4, Lexus NX */ 