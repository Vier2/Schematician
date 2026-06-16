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
import { goto } from "$app/navigation";
import type {Schema_Association,  Selection, Input_View, Schema_Instance, Instance_Node, Schema, Data_Type, Rendered_Node } from "./Schema/models";
import type { CSS_Property, CSS_Unit, Element_Handler, Value_Computer } from "./types/types";
function Make_Create_Element_UI(types: Data_Type[],
    state: Schema,
    element_container: HTMLDivElement
) {
    //make form
    //collect name
    //collect data type
    //press enter to save and add
    const name_div = document.createElement('div')
    name_div.style.display = 'flex'
    name_div.style.flexDirection = 'row'
    const name = document.createElement('input')
    const name_label = document.createElement('p')
    name_label.textContent = 'name'
    name_div.appendChild(name_label)
    name_div.appendChild(name)

    const data_type_div = document.createElement('div')
    data_type_div.style.display = 'flex'
    data_type_div.style.flexDirection = 'row'
    const data_type_select_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    data_type_select_label.textContent = 'Data Type'
    const data_type_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    Create_Options_In_Select_From_Array(data_type_select, types)
    data_type_div.appendChild(data_type_select_label)
    data_type_div.appendChild(data_type_select)
    const form = document.createElement('form')
    const submit_button = document.createElement('button')
    submit_button.textContent = 'create'
    form.appendChild(name_div)
    form.appendChild(data_type_div)
    form.appendChild(submit_button)
    form.addEventListener('keydown', Handle_Create_Schema_Form(form,
        name, data_type_select, state, element_container
    ))
    return form
}

export function Make_Button_Goto_URL(button: HTMLButtonElement, url: string) {
    button.addEventListener('click', function () {
        goto(url)
    })
}
export function Handle_Create_Schema_Form(
    form: HTMLFormElement, name_input: HTMLInputElement,
    data_type_select: HTMLSelectElement, state: Schema,
    element_container: HTMLDivElement) {
    const handle_key_down = (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
            //save element, add element, close
            //make sure name has value
            form.remove()
            const name = name_input.value
            const data_type: Data_Type = data_type_select.value as Data_Type
            const schema: Schema = {'name': name, 'data_type': data_type}
            state.elements?.push(schema)
            const p = document.createElement('p')
            p.textContent = schema.name
            p.dataset.schema = JSON.stringify(schema)
            const delete_button = document.createElement('button') as HTMLButtonElement
            delete_button.textContent = 'x'
            Make_Delete_Function_Schema(p, delete_button, state)
            const div = document.createElement('div')
            div.appendChild(p)
            div.appendChild(delete_button)
            element_container.appendChild(div)
            //4. add element to container with delete button
            //close

            event.preventDefault();
        }
    }
    return handle_key_down
}

export function Handle_Create_New_Schema(
    div: HTMLDivElement, types: Data_Type[],
    state: Schema, element_container: HTMLDivElement
) {
    const button = document.createElement('button')
    button.textContent = 'Create New Element'
    div.appendChild(button)
    button.addEventListener('click', function() {
        const form = Make_Create_Element_UI(types, state, element_container)
        div.appendChild(form)
    })
}


function Render_Schema_Input(schema: Schema): HTMLDivElement {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.flexDirection = 'row'
    const label = document.createElement('p')
    label.textContent = schema.name
    const value = document.createElement('input')
    div.appendChild(label)
    div.appendChild(value)
    return div
}
export function Render_Schema_Value_Recursive(
    schema: Schema,
    parents: Schema[] = [],
    target_container: HTMLDivElement,
    state: Schema_Instance,
    path: number[],
    ancestry_level_visible?: number,
) {
    /**
     * ancestry_level_visible: The number of ancestry of a element that will be rendered
     */
    const is_container =
        schema.data_type === 'Interface' ||
        schema.data_type === 'Associative_Array'

    if (!is_container) {

        const context_div = Render_Parent_Context(
            parents, ancestry_level_visible)
        const input_view =
            Make_Schema_Input_View(
                schema,
            )
        Link_Schema_Input_View_To_State(input_view.input, state, path)
        const label = Make_Schema_Label(schema)

        target_container.appendChild(
            context_div
        )
        target_container.appendChild(label)
        target_container.appendChild(
            input_view.container
        )


        return
    }

    schema.elements?.forEach((child, index) => {
        Render_Schema_Value_Recursive(
            child,
            [...parents, schema],
            target_container,
            state,
            [...path, index],
            ancestry_level_visible
        )
    })
}
export function Render_Parent_Context(
    parents: Schema[],
    ancestry_level_visible?: number
): HTMLDivElement {
/**
 * ancestry_level_visible: The number of ancestry of a element that will be rendered
 */
    const div = document.createElement('div')

    let visible_parents = parents

    if (ancestry_level_visible !== undefined) {

        visible_parents =
            ancestry_level_visible === 0
                ? []
                : parents.slice(-ancestry_level_visible)
    }
    visible_parents.forEach(parent => {

        const p = document.createElement('p')

        p.textContent = parent.name

        div.appendChild(p)
    })

    return div
}

export function Render_Options(
    schemas: Schema[],
    select: HTMLSelectElement,
    filter_text: string = ''
): void {
    select.innerHTML = '';

    const filtered_values = schemas.filter(schema =>
        schema.name.toLowerCase().includes(filter_text.toLowerCase())
    );

    for (const value of filtered_values) {
        const option = document.createElement('option');
        option.value = JSON.stringify(value);
        option.textContent = value.name;
        select.appendChild(option);
    }
}
export function Link_Element_to_State(state: Record<string, any>, key: string,
    element: HTMLInputElement | HTMLSelectElement) {

        element.addEventListener('input', () => {
            state[key] = element.value
            console.log(`state ${JSON.stringify(state)}`)
        })
    }
    

export async function Make_Searchable_Select(
    schemas: Schema[],
    container: HTMLDivElement,
    state: Schema
): Promise<HTMLSelectElement> {
    const label = document.createElement('p')
    label.textContent = 'Adding Existing Schema as Element'
    const search_input = document.createElement('input');
    search_input.type = 'text';
    search_input.placeholder = 'Search...';
    const element_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    element_label.textContent = 'Elements Added'
    const select = document.createElement('select');
    select.size = 10;
    
    search_input.addEventListener('input', () => {
        select.style.display = '';
        Render_Options(
            schemas,
            select,
            search_input.value
        );
    });
    search_input.addEventListener('click', () => {
        select.style.display = ''
        Render_Options(
            schemas,
            select,
            search_input.value
        );
    })

   
    select.addEventListener('input', function() {
        // search_input.value = select.value
        select.style.display = 'none';
        const p = document.createElement('p')
        p.textContent = this.textContent
        const delete_button = document.createElement('button')
        delete_button.textContent = 'x'
        Make_Delete_Function_Schema(p, delete_button, state
         )
        console.log(`schema select, selected`)

        container.appendChild(p)
        container.appendChild(delete_button)
    })
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // If click is outside both the input and the select, hide the select
        if (target !== search_input && !select.contains(target)) {
            select.style.display = 'none';
        }
    });

    container.appendChild(label)
    container.appendChild(search_input);
    container.appendChild(select);
    container.appendChild(element_label)

    return select;
}



export async function Make_Searchable_Select_Schema(
    button: HTMLButtonElement,
    schemas: Schema[],
    container: HTMLDivElement,
    state: Schema,
    selection: Selection
)  {
    button.onclick = () => {

        // const label = document.createElement('p')
        // label.textContent = 'Adding Existing Schema as Element'
        const search_input = document.createElement('input');
        search_input.type = 'text';
        search_input.placeholder = 'Search...';
        const element_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
        const select = document.createElement('select');
        select.size = 10;
    
        search_input.addEventListener('input', () => {
            select.style.display = '';
            Render_Options_Schema(
                schemas,
                select,
                search_input.value
            );
        });
        search_input.addEventListener('click', () => {
            select.style.display = ''
            Render_Options_Schema(
                schemas,
                select,
                search_input.value
            );
        })
    
    
        select.addEventListener('input', (event: Event) => {
            const Selected_Option = select.options[select.selectedIndex];
            const schema = JSON.parse(Selected_Option.dataset.schema!)
            select.style.display = 'none';
            const label = document.createElement('p')
            label.textContent = schema.name
            const div = document.createElement('div')
            div.style.display = 'flex'
            div.style.flexDirection = 'row'
            div.style.gap = '3px'
            div.appendChild(label)
            const input_view = Make_Schema_Input_View(schema)
            const viewer_element = Make_Viewer_Element(input_view.input)
            Connect_Input_View_To_State(input_view.input, state, schema, selection)
            div.appendChild(input_view.input)
            div.appendChild(viewer_element)
            container.appendChild(div)
            search_input.style.display = 'none';

        })
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
    
            // If click is outside both the input and the select, hide the select
            if (target !== search_input && !select.contains(target)) {
                select.style.display = 'none';
            }
        });
    
        // container.appendChild(label)
        container.appendChild(search_input);
        container.appendChild(select);
        container.appendChild(element_label)
    
    }
}


/**
 * Access the selection property of schema
 * create instantiate array if it doesn't already exist
 * push a new element to the array
 * link the value of the input to that instance of the array
 */
export function Connect_Input_View_To_State(
    input: HTMLInputElement | HTMLSelectElement,
    state: Schema,
    selectedSchema: Schema,
    selection: Selection
) {
    // Ensure the array exists
    if (!state[selection]) {
        state[selection] = [];
    }

    // Create the association
    const association: Schema_Association = {
        schema: selectedSchema,               // <-- THIS is the fix
        value: resolveValue(selectedSchema, input.value)
    };

    state[selection]!.push(association);
    const index = state[selection]!.length - 1;
    input.addEventListener("input", () => {
        state[selection]![index].value = input.value
    });
}




function resolveValue(schema: Schema, raw: string) {
    switch (schema.data_type) {
        case 'Number':
            return Number(raw);
        case 'Boolean':
            return raw === 'true';
        case 'String':
        default:
            return raw;
    }
}

export function Make_Collapsible(control_element: HTMLElement, div: HTMLDivElement) {
    let close: boolean = true;
    control_element.addEventListener('click', function() {
        close = !close
        if (close) {
            div.style.display = 'none'
        }
        else {
            div.style.display = ''
        }
    })
}
function Make_Labeled_Input(name: string, type: 'number' | 'string'): Input_View {
    const input = document.createElement('input')
    input.type = type
    const label = document.createElement('p')
    label.textContent = name
    const viewer = Make_Viewer_Element(input)
    const container = document.createElement('div')
    container.appendChild(label)
    container.appendChild(input)
    container.appendChild(viewer)
    return {'container': container,
        'input': input
    }
}
function Make_Boolean_Select(label: string): Input_View{
    const div = document.createElement('div')
    const p = document.createElement('p') as HTMLParagraphElement
    p.textContent = label
    const select = document.createElement('select')
    select.value = ''
    const options = Create_Options_In_Select_From_Array(select, ['True', 'False'])
    div.appendChild(p)
    div.appendChild(select)
    return {'container': div, 'input': select}
}
export function Add_Schema_Constraints_UI(data_type: Data_Type,
    div: HTMLDivElement) {
    if (data_type === 'Number') {
        const minimum_number = Make_Labeled_Input('Minimum Number?', 'number')
        div.appendChild(minimum_number.container)
        const maximum_number = Make_Labeled_Input('Maximum Number?', 'number')
        div.appendChild(maximum_number.container)
        const can_be_positive = Make_Boolean_Select('Can be Positive?')
        div.appendChild(can_be_positive.container)
        const can_be_negative = Make_Boolean_Select('Can be Negative?')
        div.appendChild(can_be_negative.container)
        
    } 
    if (data_type === 'String') {
        const maximum_characters = Make_Labeled_Input('Maximum Characters?',
            'number'
        )
        div.appendChild(maximum_characters.container)
        const minimum_characters = Make_Labeled_Input('Mininum Characters', 
            'number'
        )
        div.appendChild(minimum_characters.container)

    } 
    if (data_type === 'Interface') {
        /**
         * maybe constraints like: instances may or may not add additional elements
         * 
         */
    }
        /**
         * add constraint elements based on data type
         * string: 
         *  range element for max and minimum chars
         * number:
         *  range element for max and minimum number
         * 
         */
    }

export function Render_Options_Schema(schemas: Schema[],
    select: HTMLSelectElement,
    filter_text: string,
) {
    select.innerHTML = '';

    const filtered_values = schemas.filter(value =>
        value.name.toLowerCase().includes(filter_text.toLowerCase())
    );

    for (const value of filtered_values) {
        const option = document.createElement('option');
        option.dataset.schema = JSON.stringify(value)
        option.textContent = value.name;
        select.appendChild(option);
    }
}



 export function Handle_Data_Type_Select(
    select: HTMLSelectElement,
    schemas: Schema[],
    container: HTMLDivElement,
    constraint_container: HTMLDivElement, 
    state: Schema,
    ) {
    select.value = ''
    const data_types: Data_Type[]= ['String',
        'Number',
        'Boolean',
        'Interface',
        'Associative_Array'
    ] as const
    select.addEventListener('input', async function() {
        
        if (this.value == 'Interface') {
            const select = await Make_Searchable_Select(schemas,
                container, state
            )
            Connect_Select_To_List_State(select, state, 'elements')

            Handle_Create_New_Schema(container, data_types, state, container)

        }
        if (this.value === 'String' ||
            this.value === 'Number'
        ) {
            Add_Schema_Constraints_UI(this.value, constraint_container)

        }
    })
 }

export function Set_Instance_Value(
    instance: Schema_Instance,
    path: number[],
    value: unknown
) {

    Get_Instance_Node(
        instance.root,
        path
    ).value = value
}
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

async function Add_Popup_Select_Input(Element: HTMLInputElement, option_values: string[], Group_Container: HTMLDivElement): Promise<HTMLSelectElement> {
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
    return Select
}

export function Render_Enums(schema: Schema) {
    if (schema.enumerations &&
        Is_String_Schema(schema)
    ) {
    const select = document.createElement('select')

    Create_Options_In_Select_From_Array(

        select,
        schema.enumerations
    )
    return select
}
}
export function Make_Schema_Input_View(
    schema: Schema
): Input_View {
    const container = document.createElement('div')

    if (
        schema.enumerations &&
        Is_String_Schema(schema)
    ) {
        const p = document.createElement('p')
        p.textContent = 'Enumerations'

        const select = Render_Enums(schema)

        container.appendChild(p)
        container.appendChild(select!)

        return {'container': container, 'input': select!}
    }

    const input = Make_Schema_Input(schema)

    const viewer = Make_Viewer_Element(input)
    viewer.textContent = input.value

    container.appendChild(viewer)
    container.appendChild(input)

    if (
        schema.options &&
        Is_String_Schema(schema)
    ) {
        const p = document.createElement('p')
        p.textContent = 'Options'

        container.appendChild(p)

        Add_Popup_Select_Input(
            input,
            schema.options,
            container
        )
    }

    return {'container': container, 'input': input}
}
export function Link_Schema_Input_View_To_State(
    input: HTMLInputElement | HTMLSelectElement,
    state: Schema_Instance,
    path: number[]
) {
    /**
     * Uses path for nested schemas in instantiation, in definition use other function
     */

    if (!input) return

    Link_State(
        input,
        state,
        path
    )
}

export function Make_Schema_Label(schema: Schema): HTMLElement {
    const label = document.createElement('p')
    label.textContent = schema.name
    return label
}
export function Handle_Schema_input_rendering(
    schema: Schema,
    div: HTMLDivElement,
    state: Schema_Instance,
    path: number[]
) {

    div.replaceChildren()

    if (
        schema.data_type === 'Interface' ||
        schema.data_type === 'Associative_Array'
    ) {

        Render_Schema_Value_Recursive(
            schema,
            [],
            div,
            state,
            path,
            0
        )

        return
    }
    const input_view = Make_Schema_Input_View(
        schema
    )
    Link_Schema_Input_View_To_State(input_view.input, state, path)
    div.appendChild(
        input_view.container
    )
}


export function Make_Delete_Function_Schema(
    element: HTMLElement,
    delete_button: HTMLButtonElement,
    State: Schema
) {
    delete_button.addEventListener("click", () => {

        const list = State.elements;
        if (!list) return; // nothing to delete

        const text = element.textContent?.trim();
        if (!text) return;

        // Find the schema whose name matches the text
        const index = list.findIndex(item => item?.name === text);

        if (index !== -1) {
            list.splice(index, 1);   // remove the schema
        }

        // Remove DOM elements
        element.remove();
        delete_button.remove();
        console.log(`state after deleting ${JSON.stringify(State)}`)
    });
}

export async function Make_Delete_Function(element: HTMLElement, delete_button: HTMLButtonElement, State: Record<string, any>, key: string, type: 'number' | 'string') {
    delete_button.addEventListener("click", () => {
        console.log(`key ${key}`)
        console.log(`state ${JSON.stringify(State)}`)
        let index = 0
        if (type == 'number') {
            index = State[key].indexOf(Number(element.textContent))

        }
        if (type == 'string') {
            console.log(`key ${key}`)
            index = State[key].indexOf(element.textContent)

        }
        console.log(`index ${index}`)
        State[key].splice(index, index + 1)
        console.log(`new state after deleting ${State[key]}`)
        element.remove();
        delete_button.remove() //self destruct, lol
        //remove element from list

    });
}

export async function Add_Element_and_Delete_Button(name: string, Parent_Container: HTMLDivElement, State: Record<string, any>, key: string, type: 'number' | 'string') {
    const delete_button = document.createElement('button')
    delete_button.textContent = 'x'
    const text_element = document.createElement('p')
    text_element.textContent = name
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.flexDirection = 'row'
    div.style.gap = '5px'
    div.appendChild(text_element)
    div.appendChild(delete_button)
    Make_Delete_Function(text_element, delete_button, State, key, type)
    Parent_Container.appendChild(div)
}
export function Connect_Select_To_List_State(select: HTMLSelectElement,
    state: Record<string, any>,
    key: string
) {
    if (!state[key]) {
        state[key] = []
    }
    select.addEventListener('input', function() {
        const schema = JSON.parse(this.value)
        console.log(`key ${key}`)
        state[key].push(schema)
        select.value = ''
    })
}
function Link_State(
    element: HTMLInputElement | HTMLSelectElement,
    state: Schema_Instance,
    path: number[]
) {
    const stable_path = [...path]

    const current_value =
        Get_Instance_Value(
            state,
            stable_path
        )

    element.value =
        String(current_value ?? '')

    const event_type =
        element instanceof HTMLSelectElement
            ? 'change'
            : 'input'

    element.addEventListener(
        event_type,
        () => {
            Set_Instance_Value(
                state,
                stable_path,
                element.value
            )
        }
    )

    return current_value
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
export function Make_Viewer_Element(input: HTMLInputElement | HTMLSelectElement): HTMLParagraphElement {
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

export function Link_Viewer_Input(viewer: HTMLElement, input: HTMLInputElement | HTMLSelectElement) {
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


export function Make_Schema_Association_Function(div: HTMLDivElement,

) {

}

export function Add_Hierarchical_Elements(
    map_div: HTMLDivElement,
    top_level_schema: Schema
) {
    return Render_Schema_Node(
        top_level_schema,
        map_div,
        0
    )
}
export function Get_Instance_Node(
    root: Instance_Node,
    path: number[]
): Instance_Node {

    let current = root

    for (const index of path) {

        current.elements ??= []

        current.elements[index] ??= {}

        current =
            current.elements[index]
    }

    return current
}
export function Get_Instance_Value(
    instance: Schema_Instance,
    path: number[]
) {

    return Get_Instance_Node(
        instance.root,
        path
    ).value
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
    path: number[] = [],
    list: Rendered_Node[] = []
): Rendered_Node[] {

    const row = document.createElement('div')

    Add_Flex_Style(row, 'row')
    Apply_Length_Value_CSS(row, 'marginLeft', 'px', depth * 20)
    const label =Make_Bold_P_Element(schema.name)
    Apply_Hover_Highlight(label, 'red')
    row.appendChild(label)

    parent.appendChild(row)

    list.push({
        schema,
        element: label,
        path
    })

    schema.elements?.forEach(
        (child, index) =>
            Render_Schema_Node(
                child,
                parent,
                depth + 1,
                [...path, index],
                list
            )
    )

    return list
}
export function Add_Event_Map_Elements(current_schema_div: HTMLDivElement, 
    current_schemas: Rendered_Node[],
    previous_button: HTMLButtonElement, 
    next_button: HTMLButtonElement,
    current_instance_div: HTMLDivElement,
    state: Schema_Instance ) {
    for (const [index, item] of current_schemas.entries()) {
        item.element.addEventListener('click', function() {
            current_schema_div.replaceChildren()
            current_instance_div.replaceChildren()
            Render_Schema_MetaData(item.schema, current_schema_div)
            Render_Adjacent_Elements(
                index, current_schemas, previous_button, next_button,
                current_schema_div,
                current_instance_div,
                state,
            )
            Handle_Schema_input_rendering(item.schema, 
                current_instance_div, state,
                item.path)
           
        })
    }
}
export function Render_Adjacent_Elements(
    current_index: number,
    current_schemas: Rendered_Node[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_schema_div: HTMLDivElement,
    current_instance_div: HTMLDivElement,
    state: Schema_Instance,
) {
    const previous = current_schemas[current_index - 1]
    const next = current_schemas[current_index + 1]

    Modify_Button_Element(
        previous_button,
        previous?.schema ?? null,
        current_index - 1,
        current_schemas,
        previous_button,
        next_button,
        current_schema_div,
        current_instance_div,
        state,
        previous?.path ?? []
    )

    Modify_Button_Element(
        next_button,
        next?.schema ?? null,
        current_index + 1,
        current_schemas,
        previous_button,
        next_button,
        current_schema_div,
        current_instance_div,
        state,
        next?.path ?? []
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
    current_schemas: Rendered_Node[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_schema_div: HTMLDivElement,
    current_instance_div: HTMLDivElement,
    state: Schema_Instance,
    path: number[]
) {
    button.textContent = schema ? schema.name : '—'
    button.disabled = schema === null
    console.log(
        `Button ${button.textContent} assigned path`,
        JSON.stringify(path)
    )
    // Replaces any existing handler — no accumulation
    button.onclick = () => {
        if (!schema) return
        current_schema_div.replaceChildren()
        Render_Schema_MetaData(schema, current_schema_div)
        Render_Adjacent_Elements(
            target_index,
            current_schemas,
            previous_button,
            next_button,
            current_schema_div,
            current_instance_div,
            state,
        )
        Handle_Schema_input_rendering(schema, current_instance_div,
            state, path
            
        )
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