/*make a function that will apply a descending indentation
effect on any children of a div element. Current or new elements
parameters: indentation amount and parent div element

implementation:
1. Shift current child elements
    1a. Get all children element, sort from top to bottom
    1b. iterate through the element, incrementally shifting by the the indentation parameter,
        by setting the margin left attribute


2. shift new elements
    2a. add a event listener to div element
    2b. Whenever child element is added, read adjacent sibling margin left value
        and adding the margin left value to that, setting it
*/
import type { Schema, Data_Type } from "./Schema/models";
import type { CSS_Property, CSS_Unit, Element_Handler, Value_Computer } from "./types/types";
/**
 Apply a Descending Indentation structure to elements currently in, and added to a div element
 */

export function Apply_Descending_Indentation(parent: HTMLDivElement, margin: number) {
    Add_Flex_Style(parent, 'column')
   Apply_Incremental_CSS_To_Children(parent, 'marginLeft', margin, 'px')
    Observe_New_Children(parent, (node) => {
        const previous = node.previousElementSibling as HTMLElement | null
        const compute: Value_Computer = () => {
            const previous_value = parseFloat(previous?.style.marginLeft ?? '0') || 0
            return previous === null ? margin : previous_value + margin
        }
        Apply_Length_Value_CSS(node, "marginLeft", "px", compute())
    })
}
export function Add_Flex_Style(element: HTMLElement, flex_direction: string) {
    element.style.display = 'flex'
    element.style.flexDirection = flex_direction
}
export function Apply_Incremental_CSS_To_Children(parent: HTMLDivElement, property: CSS_Property, 
    init_value: number, unit: CSS_Unit
) {
    const children = Create_Child_Element_Array(parent)
    children.forEach((element, index) => {
        const value = (index + 1) * init_value
        Apply_Length_Value_CSS(element, property, unit, value)
    })

}

async function Add_Popup_Select_Input(Element: HTMLInputElement, option_values: string[], Group_Container: HTMLDivElement) {
    const Select: HTMLSelectElement = document.createElement('select');
    option_values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value
        Select.appendChild(option)
    })
    Element.addEventListener('focus', function () {

        Select.value = "" //to remove issue where first value can't be selected unless something is selected first
        Group_Container.appendChild(Select);

    })
    Select.addEventListener('input', function () {
        Element.value = this.value
        Element.dispatchEvent(new Event("input", { bubbles: true })); //notifying element of input
        Select.remove()
    })

}
export function Handle_Schema_input_rendering(schema: Schema, div: HTMLDivElement) {
    console.log(`schema ${schema.name} has type
        ${schema.data_type}`)
    console.log('handle input function starting')
    if (schema.data_type == 'Interface' || schema.data_type == 'Associative_Array')
    {
        console.log('tis interface exiting')
        return
        
    }

    //handle enumerations and options. Only allow one or the other
    if (schema.enumerations && Is_String_Schema(schema)) {
        //select element
        console.log('schema as enums')
        const p = document.createElement('p')
        p.textContent = `Enumerations`
        div.appendChild(p)
        const select_element = document.createElement('select')
        Create_Options_In_Select_From_Array(select_element, schema.enumerations 
        )
        div.appendChild(select_element)
        return
    }
    console.log(`schema has no enums`)
    div.replaceChildren()
    const input = Make_Schema_Input(schema)
    const view = Make_Viewer_Element(input)
    div.appendChild(view)
    div.appendChild(input)
    
    if (schema.options && Is_String_Schema(schema)) {
        const p = document.createElement('p')
        p.textContent = `Options`
        div.appendChild(p)
        Add_Popup_Select_Input(input, schema.options,
            div
        )
        //make input element with select element
    }
    

}
function Is_String_Schema(
    schema: Schema
): schema is Schema<'String'> {
    return schema.data_type === 'String'
}
export function Make_Schema_Input(schema: Schema): HTMLInputElement {
    const input = document.createElement('input')
    input.type = schema.data_type.toLowerCase()
    if (
        Is_String_Schema(schema)
        && schema.constraints?.maximum_characters !== undefined
    ) {
        input.maxLength =
            schema.constraints.maximum_characters
    }
    return input
}
export function Make_Viewer_Element(input: HTMLInputElement): HTMLParagraphElement {
    const p = document.createElement('p')
    p.style.overflowWrap = 'break-word'
    Link_Viewer_Input(p, input)
    return p
}
export function Create_Options_In_Select_From_Array(Select_Element: HTMLSelectElement, Array: readonly string[]) {
    Array.forEach((item) => {
        const option = document.createElement('option')
        option.textContent = item
        option.value = item
        Select_Element.append(option)
    })
}

export function Link_Viewer_Input(viewer: HTMLElement, input: HTMLElement) {
    input.addEventListener('input', (event: Event) => {
        let target = event.target as HTMLInputElement;
        let value = target.value;
        viewer.textContent = value

    });
}
export function Render_Schema_MetaData(schema: Schema,
    parent_container: HTMLDivElement
) {
    const name = Make_Bold_P_Element(schema.name)
    parent_container.appendChild(name)
    schema.identifiers?.forEach(element => {
        const div = document.createElement('div')
        const identifier: HTMLParagraphElement = Make_Bold_P_Element(element.schema.name)
        const value_element = document.createElement('p')
        value_element.textContent = `${element.value}`
        div.style.display = 'flex'
        div.style.flexDirection = 'row'
        div.style.gap = '5px'
        div.appendChild(identifier)
        div.appendChild(value_element)
        parent_container.appendChild(div)
    });
    schema.properties?.forEach(element => {
        const div = document.createElement('div')
        const property: HTMLParagraphElement = Make_Bold_P_Element(element.schema.name)
        const value_element = document.createElement('p')
        value_element.textContent = `${element.value}`
        div.style.display = 'flex'
        div.style.flexDirection = 'row'
        div.style.gap = '5px'
        div.appendChild(property)
        div.appendChild(value_element)
        parent_container.appendChild(div)
    })
    Apply_Descending_Indentation(parent_container, 40)
}
export function Convert_Camel_to_Kebab(camel: CSS_Property): string {
    const kebab = (camel as string).replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)
    return kebab

}

// export function Add_Hierarchical_Elements(Map_Div: HTMLDivElement, 
//     Top_Level_Schema: Schema) {
//     /**
//      * Will need to take in state as well
//      * 1. Recursively, For every element in the schema, make a p element,
//      * with the text_content = to the schema.name
//      * and for each hierarchical level, make a indentation
//      * so for complex sentence
//      *      Complex_Sentence
//      *          Independent_Clause
//      *          Subordinating_Conjunction
//      *          Dependent_Clause
//      * 
//      * 3. 
//      */
   
// }

export function Add_Hierarchical_Elements(
    Map_Div: HTMLDivElement,
    Top_Level_Schema: Schema
) {
    
    const list = Render_Schema_Node(Top_Level_Schema, Map_Div, 0)
    return list
}
export function Apply_Hover_Highlight(element: HTMLElement, color: string) {
    const original = element.style.backgroundColor
    element.addEventListener('mouseenter', () => {
        element.style.backgroundColor = color
    })
    element.addEventListener('mouseleave', () => {
        element.style.backgroundColor = original
    })
}
function Render_Schema_Node(
    schema: Schema,
    parent: HTMLElement,
    depth: number,
    list: { schema: Schema; element: HTMLParagraphElement }[] = []
): { schema: Schema; element: HTMLParagraphElement }[] {

    const row = document.createElement('div')
    Add_Flex_Style(row, 'row')
    Apply_Length_Value_CSS(row, 'marginLeft', 'px', depth * 20)

    const label = Make_Bold_P_Element(schema.name)
    Apply_Hover_Highlight(label, 'red')
    row.appendChild(label)
    parent.appendChild(row)

    list.push({ schema, element: label })

    schema.elements?.forEach(child =>
        Render_Schema_Node(child, parent, depth + 1, list)
    )

    return list
}
export function Add_Event_Map_Elements(current_schema_div: HTMLDivElement, 
    list: { schema: Schema; element: HTMLParagraphElement }[],
    previous_button: HTMLButtonElement, 
    next_button: HTMLButtonElement,
    current_instance_div: HTMLDivElement ) {
    for (const [index, item] of list.entries()) {
        item.element.addEventListener('click', function() {
            current_schema_div.replaceChildren()
            current_instance_div.replaceChildren()
            Render_Schema_MetaData(item.schema, current_schema_div)
            Render_Adjacent_Elements(index, list, previous_button, next_button,
                current_schema_div,
                current_instance_div
            )
            Handle_Schema_input_rendering(item.schema, 
                current_instance_div)
           
        })
    }
}
export function Render_Adjacent_Elements(
    current_index: number,
    list: { schema: Schema; element: HTMLParagraphElement }[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_schema_div: HTMLDivElement,
    current_instance_div: HTMLDivElement
) {
    const previous = list[current_index - 1]
    const next = list[current_index + 1]

    Modify_Button_Element(
        previous_button,
        previous?.schema ?? null,
        current_index - 1,
        list,
        previous_button,
        next_button,
        current_schema_div,
        current_instance_div
    )

    Modify_Button_Element(
        next_button,
        next?.schema ?? null,
        current_index + 1,
        list,
        previous_button,
        next_button,
        current_schema_div,
        current_instance_div
    )
}

export function Create_Schema<
    T extends Data_Type
>(
    schema: Schema<T>
): Schema<T> {
    return schema
}
export function Modify_Button_Element(
    button: HTMLButtonElement,
    schema: Schema | null,
    target_index: number,
    list: { schema: Schema; element: HTMLParagraphElement }[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_schema_div: HTMLDivElement,
    current_instance_div: HTMLDivElement
) {
    button.textContent = schema ? schema.name : '—'
    button.disabled = schema === null

    // Replaces any existing handler — no accumulation
    button.onclick = () => {
        if (!schema) return
        current_schema_div.replaceChildren()
        Render_Schema_MetaData(schema, current_schema_div)
        Render_Adjacent_Elements(
            target_index,
            list,
            previous_button,
            next_button,
            current_schema_div,
            current_instance_div
        )
        Handle_Schema_input_rendering(schema, current_instance_div)
    }
}
export function Make_Bold_P_Element(text: string) {
    const p = document.createElement('p')
    p.style.fontWeight = 'bold'
    p.textContent = text
    return p
}
export function Add_Header_For_Each_KeyValue(object: {[key: string]: any}, Parent: HTMLDivElement) {
    const keys: string[] = Object.keys(object);
    console.log(`keys ${keys}`)
    console.log(`object ${JSON.stringify(object)}`)
    keys.forEach(key => {
        const parameter = document.createElement('header')
        parameter.textContent = key
        const value = document.createElement('header')
        value.textContent = object[key]
        const div = document.createElement('div');
        Add_Flex_Style(div, 'row')
        div.appendChild(parameter)
        div.appendChild(value)
        Parent.appendChild(div)
    })
}
export function Observe_New_Children<T extends any[]>(
    parent: HTMLElement,
    handler: Element_Handler<T>,
    ...args: T
): MutationObserver {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {
                    handler(node, ...args)
                }
            }
        }
    })

    observer.observe(parent, { childList: true })
    return observer
}


//general operation. incrementation. 

export function Create_Child_Element_Array(Div_Element: HTMLDivElement): HTMLElement[] {
    const Child_Collection: HTMLCollection = Div_Element.children;
    const Collection_Array: HTMLElement[] = Array.from(Child_Collection) as HTMLElement[]
    return Collection_Array
}

/* 
@param property - Css propetry for style in camelCase
*/
export function Apply_Length_Value_CSS(Element: HTMLElement, property: CSS_Property, unit: CSS_Unit, value: number) {
    const kebab_property: string = Convert_Camel_to_Kebab(property)
    Element.style.setProperty(kebab_property, `${value}${unit}`)
}

/* as I'm pondering how to make the function singular resposibility and abstract, I kept going higher.
 to explain I wanted to make a function to incrementally add a margin value to a list of html element
 Then I considered if I should make a function to apply a margin, then I realized I should make the 
unit and value a parameter. Then I realized that other css styles that the same parameters so I should
make a function to apply a css style with style, unit, and parameter as inputs. But then I realized not all
css styles have a unit, or share units. So now I should I should categorize css styles according to shared attributes,
units, data type, and enumerations. Now i'm considering the fact that this may already be a library, and considering using
a library for css styling like tailwind. But I'm inclined to not because of this principle I'm about to describe.
I developed a inclication for universal, transferable, consistently deployable strategy over niche or hyperspecialized frameworks.
So I would rather code in that way that will work in various environments or frameworks, which may be not the optimized or most efficient approach 
for that one environment. But will have consistent success. I like domain fidelty. I like the idea of mathematical purity.
*/