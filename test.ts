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
const Transmission: Schema = {'name': 'Transmission', 'data_type': 'Interface', 'identifiers': Electric_Motor_Idenitifier}
const Chassis: Schema = {'name': 'Chassis', 'data_type': 'Interface'} /**Frame, suspension, steering, brakes, wheels, tires */
const Powertrain: Schema = { 'name': 'Powertrain', 'data_type': 'Interface', 'elements': [Electric_Motor, Engine, Transmission] } /**Engine, Electric Motor, transmission, driveshaft, differential, axle */
const Road_Vehicle_Definition = `Any self propelled 
or tracked machine designed primarily to transport people, animals, or goods
on public roads and highways`

const Road_Vehicle_Identifiers: Schema_Association[] = [{'schema': Definition, 'value': Road_Vehicle_Definition}]
                                 
const Road_Vehicle: Schema = {"name": 'Road Vehicle', 'data_type': 'Interface', 
                            'elements': [Powertrain,  Chassis], 'identifiers': Road_Vehicle_Identifiers}


/*Goal:
1. Create Schema to represent a Road Vehicle, and instances of Road Vehicles: Rav4, Lexus NX */