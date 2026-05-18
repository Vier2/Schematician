

type Number_Comparsion_Operator = '=' | '>' | '<' | '>=' | '<=' 
type String_Comparsion_Operator = 'in' | '=' //same value, //same length

//1. element -> operator -> element -> Operation |  🔄
//case = relationship: element / operator / element
//

/**examples: element: 1. Supply = On -> DCV = Extend -> Cylinder = Extend | Supply = Off -> DCV = neutral 
 *

**/

//parameter 1: element, parameter 1, comparsion operator, comparison element,

/**decision: What is the definitional distinction between logic and rule?
 * Because a rule can be like a constant mathematical relationship, and logic can be defining the behavior of
 * a system. If I were to define a fluid power circuit in this manner, I could write logic that if the supply
 * goes through the p port of a dcv, and the lever is actuated, then fluid will travel through, and map out every possible condition
 *. And for mathematical relationship within this circuit those can be defined through rules * 
**/


/**
 * Core Distinction
Rule = Declarative constraint or invariant
Logic = Procedural or conditional behavior
1. What a Rule Is

A rule states something that is always true (or must be true).

It does not describe flow or sequence, only relationships or constraints.

Examples
 */


/*
Goal: Make a program that takes a list of elements, data types of each element, and allows you to make
logic branching for each possible configuraiton of the composition.

1. make a select element containing options for each element
2. when a element is selected, create sub branches for each possible comparsion state value of that element
3. one can either attach another condition or make a declaration (like setting a value, etc)
4. when done finish to create logic

consideration: logic should be composed in a way so that it works based on standard, not hard coded
configuration every time. For example, one should be able to define the behavior of differnet components,
and put them together in different arragements, and they will operate based on logical connection not reprogramming
everytime. Like I should able to create the logic of a DCV, check valve, cylinder, needle valve, and put them together in any configuration
and the logic will work itself out. Without having to define it for every position.
Now how is this done?
Hypothesis: The input parameters of a component have to be mapped to the properties of another component which matches the type
for example, a supply port can have a state of on or off, it supplies flow. And a DCV has a input parameter of flow. So I could call
DCV, passing the argument of supply ports flow, and this will work itself out. So I need to implement this in the schema system.
This is like smart logic in Robotic studio where different conditions are handled with function block diagrams.


Compositional Systems Design


Supply port:
    properties
        state: ON | off //derived property
        pressure:
Directional Control Valve

one property of a element is being mapped, connected to, or passed to the element of another like a value
A element can specify the absolute type allowed to be connected for accuracy. For example, a pressure port of a DCV
wont accept just like a number, it needs to be a pressure. And this component can be used axiomatically anywhere
Goal:
Make a program that will take in a object, take its properties, and create options out of those properties.
And connect/link a property to a property of another object. And that object will produce its own values/properties and those can be connected to something else

Example User story:
1. User select supply port
2. User brings in Directional control valve
3. User links pressure property of supply port to p port of DCV
4. User links a port of DCV to cylinder extend and b port to cylinder retract
4. User links return port of DCV to return tank
5. User simulates the system
6. User sets the unit of pressure to PSI and sets PSI to 60
7. User sets lever of DCV to in
8. Cylinder extends
Class Directional_Control_Valve:
    if Direcional_Control_Valve.Lever = 'Extend'
       Directional_Control_Valve.a_port.pressure =  Directional_Control_Valve.p_port.pressure
    if Direcional_Control_Valve.Lever = 'Retract'
        Directional_Control_Valve.b_port.pressure = Directional_Control_Valve.p_port.pressure 
    if Direcional_Control_Valve.Lever = 'Neutral'
        Directional_Control_Valve.b_port.pressure = 0
        Directional_Control_Valve.a_port.pressure = 0
class Cylinder:

    def update(self):
        if self.extend_port.pressure > self.retract_port.pressure:
            self.position = "extending"
        elif self.retract_port.pressure > self.extend_port.pressure:
            self.position = "retracting"
        else:
            self.position = "neutral"
*/

/**
 * Goal user story completion:
 * 1. User is creating pneumatic circuit
 * 2. user selects supply manifold
 * 3. user selects Directional_Control_Valve
 * 3. User connect supply manifold.port to Direcional_Control_Valve.p port
 * Brain storming
 * So I need a function that takes a object, a property of that object, and passes it to the property of another object
 * 
 */
function Link_Object_Properties(from_object: Record<string, any>, from_object_property: string, 
                                    to_object: Record<string, any>, to_property: string) {
        //might need a event listener type method to link this live
        to_object[to_property] = from_object[from_object_property]
                                    }
function Return_Object_Properties(object: string): string[]{
    return Object.keys(object)

}
