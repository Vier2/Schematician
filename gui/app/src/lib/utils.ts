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
import type { Cardinality, Instance_Node, Schema_Element, Update_Schema_Data } from "@schematician/shared";
import type { GraphQL_Schema } from "@schematician/shared";
import { Send_GraphQL_Request, Convert_Schema_To_Update_Data } from "./graphql/utils";
import type { Create_Schema_Input, Create_Schema_Response, Update_Schema_Response} from "./graphql/types";
import type { Schema, Data_Type, Schema_Instance } from "@schematician/shared";
import type { Rendered_Search_Value, Input_View, Input_Viewer,  Rendered_Node } from "./Schema/models";
import type { CSS_Property,  Schemas_Query_Response, CSS_Unit, GraphQL_Response, Element_Handler, Value_Computer } from "./types/types";
import type { Selection, Schema_Value, Schema_Association} from "@schematician/shared";
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

    const index_input: HTMLInputElement = document.createElement('input')
    index_input.type = 'number'
    index_input.value = ((state.elements?.length ?? 0) + 1).toString();    
    const index_label: HTMLParagraphElement = document.createElement('p')
    index_label.textContent = 'index'
    const index_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    index_div.appendChild(index_label)
    index_div.appendChild(index_input)

    const required_input: HTMLInputElement = document.createElement('input')
    const required_input_label: HTMLParagraphElement = document.createElement('p')
    required_input_label.textContent = 'Required?'
    required_input.type = 'checkbox'
    const required_div:HTMLDivElement = document.createElement('div') as HTMLDivElement
    required_div.appendChild(required_input_label)
    required_div.appendChild(required_input)

    const cardinality_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    Create_Options_In_Select_From_Array(cardinality_select, ['Single', 'Array'])
    const cardinality_select_label:HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    cardinality_select_label.textContent = 'Cardinality'
    const cardinality_div:HTMLDivElement = document.createElement('div') as HTMLDivElement
    cardinality_div.appendChild(cardinality_select_label)
    cardinality_div.appendChild(cardinality_select)

    form.appendChild(name_div)
    form.appendChild(data_type_div)
    form.appendChild(index_div)
    form.appendChild(required_div)
    form.appendChild(cardinality_div)
    form.appendChild(submit_button)
    form.addEventListener('keydown', Handle_Create_Schema_Form(form,
        name, data_type_select, state, element_container,
        cardinality_select,
        index_input,
        required_input
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
    element_container: HTMLDivElement,
    cardinality_select: HTMLSelectElement,
    index_input: HTMLInputElement,
    required_input: HTMLInputElement) {
    const handle_key_down = (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
            //save element, add element, close
            //make sure name has value
            form.remove()
            const name = name_input.value
            const data_type: Data_Type = data_type_select.value as Data_Type
            const schema: Schema = {'name': name, 'data_type': data_type}
            const schema_element: Schema_Element = {
                'element': schema, 
                'cardinality': cardinality_select.value as Cardinality,
                'index': Number(index_input.value),
                'required': required_input.checked
            }
            /**
             * index input
             * 
             * 
             */
            state.elements?.push(schema_element)
            const p = document.createElement('p')
            p.textContent = schema.name
            p.dataset.schema = JSON.stringify(schema)
            const delete_button = document.createElement('button') as HTMLButtonElement
            delete_button.textContent = 'x'
            const div = document.createElement('div')
            div.appendChild(p)
            div.appendChild(delete_button)
            Make_Delete_Function_Schema(div, schema_element, delete_button, state)
            element_container.appendChild(div)
            //4. add element to container with delete button
            //close

            event.preventDefault();
        }
    }
    return handle_key_down
}

export function Add_Save_Schema_Function(
    button: HTMLButtonElement,
    state: Schema,
    api_url: string
): void {
    button.addEventListener(
        'click',
        async function (): Promise<void> {
            const update_data =
                Convert_Schema_To_Update_Data(state)

            const result =
                await Send_GraphQL_Request<
                    Update_Schema_Response,
                    {
                        schema: Update_Schema_Data
                    }
                >({
                    api_url,

                    operation_type: 'mutation',

                    operation_name: 'Update_Schema',

                    field_name: 'update_schema',

                    variables: [
                        {
                            name: 'schema',
                            type: 'Update_Schema_Input!'
                        }
                    ],

                    input_data: {
                        schema: update_data
                    },

                    selection: [
                        'uid',
                        'name',
                        'data_type',
                        'image',
                        'rules',
                        'logic',
                        'relationships',
                        'enumerations',
                        'options',

                        {
                            field: 'elements',
                            selection: [
                                'index',
                                'required',
                                'cardinality',

                                {
                                    field: 'element',
                                    selection: [
                                        'uid',
                                        'name',
                                        'data_type'
                                    ]
                                }
                            ]
                        },

                        {
                            field: 'properties',
                            selection: [
                                'value',

                                {
                                    field: 'schema',
                                    selection: [
                                        'uid',
                                        'name',
                                        'data_type'
                                    ]
                                }
                            ]
                        },

                        {
                            field: 'identifiers',
                            selection: [
                                'value',

                                {
                                    field: 'schema',
                                    selection: [
                                        'uid',
                                        'name',
                                        'data_type'
                                    ]
                                }
                            ]
                        }
                    ],

                    token:
                        localStorage.getItem('token') ??
                        undefined
                })

            const updated_schema =
                result.schema

            /*
             * Use updated_schema here if the local state
             * should be refreshed after saving.
             */
            console.log(
                'Updated schema:',
                updated_schema
            )
        }
    )
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

export function Add_Existing_Modal_State(
    title: string,
    selection: string,
    state: Schema
) {
    /**create searchable select */
}
export function Create_Add_Schema_Button(
    api_url: string,
    container: HTMLDivElement,
    state: Schema,
    selection: Selection
) {
    Create_Schema_Modal
}
export function Create_Schema_Element_Modal(
    api_url: string,
    previous_index: number
): Promise<Schema_Element> | null {
    /**Create popup window to create a schema */

    const data_type_array = ['String', 'Composite', 'Number', 'Boolean', 'Array']
    const container = Create_Modal_Container()
    const overlay = Create_Modal_Overlay()
    overlay.appendChild(container)
    document.body.appendChild(overlay)
    const name: HTMLInputElement = document.createElement('input') as HTMLInputElement
    const name_label = document.createElement('p')
    name_label.textContent = 'Name'
    const data_type: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    const data_type_label = document.createElement('p')
    data_type_label.textContent = 'Data Type'
    Create_Options_In_Select_From_Array(data_type, data_type_array)
    const submit: HTMLButtonElement = document.createElement('button') as HTMLButtonElement
    submit.textContent = 'submit'
    const index_input: HTMLInputElement = document.createElement('input')
    index_input.type = 'number'
    index_input.value = ((previous_index) + 1).toString();
    const index_label: HTMLParagraphElement = document.createElement('p')
    index_label.textContent = 'index'
    const index_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    index_div.appendChild(index_label)
    index_div.appendChild(index_input)

    const required_input: HTMLInputElement = document.createElement('input')
    const required_input_label: HTMLParagraphElement = document.createElement('p')
    required_input_label.textContent = 'Required?'
    required_input.type = 'checkbox'
    const required_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    required_div.appendChild(required_input_label)
    required_div.appendChild(required_input)

    const cardinality_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    Create_Options_In_Select_From_Array(cardinality_select, ['Single', 'Array'])
    const cardinality_select_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    cardinality_select_label.textContent = 'Cardinality'
    const cardinality_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    cardinality_div.appendChild(cardinality_select_label)
    cardinality_div.appendChild(cardinality_select)
    container.appendChild(name_label)
    container.appendChild(name)
    container.appendChild(data_type_label)
    container.appendChild(data_type)
    container.appendChild(index_div)
    container.appendChild(required_div)
    container.appendChild(cardinality_div)
    container.appendChild(submit)

    return new Promise((resolve) => {

        submit.addEventListener('click', async () => {
            const result =
                await Send_GraphQL_Request<
                    Create_Schema_Response,
                    Create_Schema_Input
                >({
                    api_url,
                    operation_type: 'mutation',
                    operation_name: 'Create_Schema',
                    field_name: 'create_schema',
                    variables: [
                        { name: 'name', type: 'String!' },
                        { name: 'data_type', type: 'Data_Type!' }
                    ],
                    input_data: {
                        name: name.value,
                        data_type: data_type.value as Data_Type
                    },
                    selection: [
                        'uid',
                        'name',
                        'data_type'
                    ]
                })

            overlay.remove()

            const graphql_schema: GraphQL_Schema =
                result.create_schema
            const schema = Convert_GraphQL_Schema_To_Schema(graphql_schema)
            const schema_element: Schema_Element = {
                element: schema,
                required: required_input.checked,
                index: Number(index_input.value),
                cardinality: cardinality_select.value as Cardinality
            }

            overlay.remove()

            resolve(schema_element)
        })

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                overlay.remove()

                return null
            }
        })
    })
}
export function Create_Schema_Modal(
    api_url: string
): Promise<GraphQL_Schema> | null {
    /**Create popup window to create a schema */
    
    const data_type_array = ['String', 'Composite', 'Number', 'Boolean', 'Array']
    const container = Create_Modal_Container()
    const overlay = Create_Modal_Overlay()
    overlay.appendChild(container)
    document.body.appendChild(overlay)
    const name: HTMLInputElement = document.createElement('input') as HTMLInputElement
    const name_label = document.createElement('p')
    name_label.textContent = 'Name'
    const data_type: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    const data_type_label = document.createElement('p')
    data_type_label.textContent = 'Data Type'
    Create_Options_In_Select_From_Array(data_type, data_type_array)
    const submit: HTMLButtonElement = document.createElement('button') as HTMLButtonElement
    submit.textContent = 'submit'
    container.appendChild(name_label)
    container.appendChild(name)
    container.appendChild(data_type_label)
    container.appendChild(data_type)
    container.appendChild(submit)
    return new Promise((resolve) => {

    submit.addEventListener('click', async () => {
        const result =
            await Send_GraphQL_Request<
                Create_Schema_Response,
                Create_Schema_Input
            >({
                api_url,
                operation_type: 'mutation',
                operation_name: 'Create_Schema',
                field_name: 'create_schema',
                variables: [
                    { name: 'name', type: 'String!' },
                    { name: 'data_type', type: 'Data_Type!' }
                ],
                input_data: {
                    name: name.value,
                    data_type: data_type.value as Data_Type
                },
                selection: [
                    'uid',
                    'name',
                    'data_type'
                ]
            })

        overlay.remove()

        resolve(result.create_schema)
    })

    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            overlay.remove()

            return null
        }
    })
})
}
function Handle_Save_Schema_Button(
    button: HTMLButtonElement,
    state: Schema) {
    button.addEventListener('click', function() {

        /** */
        /**
         * send create schema mutation
         */
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
        schema.data_type === 'Composite' ||
    console.log(`running recursive`)
    if (!is_container) {
        console.log(`schema aint container ${schema}`)
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
            child.element,
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
    button: HTMLButtonElement,
    schemas: Schema[],
    div: HTMLDivElement,
    state: Schema,
    client_url: string,
    select: HTMLSelectElement
)  {
    button.addEventListener('click', function() {

        const container = Create_Modal_Container()
        const overlay = Create_Modal_Overlay()
        const label = document.createElement('p')
        const search_input = document.createElement('input');
        search_input.type = 'text';
        search_input.placeholder = 'Search...';
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
    
       
        select.addEventListener('input', function() {
            const Selected_Option = select.options[select.selectedIndex];
            const schema = JSON.parse(Selected_Option.dataset.schema!) as Schema
            select.style.display = 'none';
            let index = 0
            if (!state.elements) {
                state.elements = []

            } else {
                index = state.elements.length + 1
            }
            /**set default, could choose to have user select later */
            const schema_element: Schema_Element = {
                'element': schema,
                'cardinality': 'Single',
                'required': true,
                'index': index
            }
            state.elements.push(schema_element)
            Create_Schema_Element(
                schema_element,
                state,
                div,
                client_url
            )
            console.log(`state aftering pushing ${schema.name} ${JSON.stringify(state)}`)
            search_input.style.display = 'none';
            overlay.style.display = 'none'
         
           
        })
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
    
            // If click is outside both the input and the select, hide the select
            if (target !== search_input && !select.contains(target)) {
                select.style.display = 'none';
              
                
            }
        });
        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                overlay.remove()
            }
        })
        container.appendChild(label)
        container.appendChild(search_input);
        container.appendChild(select);
        overlay.append(container)
        document.body.appendChild(overlay)
        return select;
    })
}

export function Create_Schema_Element(
    element: Schema_Element,
    state: Schema,
    container: HTMLDivElement,
    client_url: string
) {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.flexDirection = 'row'
    div.style.gap = '3%'
    const edit_link:HTMLAnchorElement = document.createElement('a')
    edit_link.textContent = element.element.name
    edit_link.href = `${client_url}/Schema/Definition/${element.element.uid}`
    edit_link.rel = 'external'
    const delete_button = document.createElement('button')
    delete_button.textContent = 'x'
    Make_Delete_Function_Schema(div, element, delete_button, state
    )
    
    console.log(`schema select, selected`)
    const information_tooltip: HTMLParagraphElement = document.createElement('p')
    information_tooltip.textContent = "?" /**TODO: add info */

    const index_input: HTMLInputElement = document.createElement('input')
    index_input.type = 'number'
    index_input.value = `${element.index}`
    const index_label: HTMLParagraphElement = document.createElement('p')
    index_label.textContent = 'index'
    const index_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    index_div.appendChild(index_label)
    index_div.appendChild(index_input)
    const required_input: HTMLInputElement = document.createElement('input')
    const required_input_label: HTMLParagraphElement = document.createElement('p')
    required_input_label.textContent = 'Required?'
    required_input.type = 'checkbox'
    required_input.checked = element.required
    const required_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    required_div.appendChild(required_input_label)
    required_div.appendChild(required_input)
    

    const cardinality_select: HTMLSelectElement = document.createElement('select') as HTMLSelectElement
    Create_Options_In_Select_From_Array(cardinality_select, ['Single', 'Array'])
    const cardinality_select_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    cardinality_select_label.textContent = 'Cardinality'
    const cardinality_div: HTMLDivElement = document.createElement('div') as HTMLDivElement
    cardinality_div.appendChild(cardinality_select_label)
    cardinality_div.appendChild(cardinality_select)
    div.style.overflowX = 'scroll'
    div.appendChild(index_label)
    div.appendChild(index_input)
    div.appendChild(cardinality_select_label)
    div.appendChild(cardinality_select)
    div.appendChild(required_input_label)
    div.appendChild(required_input)
    div.appendChild(edit_link)
    div.appendChild(information_tooltip)
    div.appendChild(delete_button)
    container.appendChild(div)
}
export function Connect_Schema_Element_Property_State(
    state: Schema,
    element: Schema_Element,
    required: HTMLInputElement,
    index: HTMLInputElement,
    cardinality: HTMLSelectElement
) {
    cardinality.addEventListener('change', function() {
        state.elements![element.index].cardinality = cardinality.value as Cardinality

    })
    required.addEventListener('change', function() {
        state.elements![element.index].required = required.checked
    })
    index.addEventListener('change', function() {
        state.elements![element.index].index = Number(index.value)
    })
}
export function Create_Modal_Overlay(): HTMLDivElement {
    const overlay = document.createElement('div')
    
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
    overlay.style.display = 'flex'
    overlay.style.justifyContent = 'center'
    overlay.style.alignItems = 'center'
    overlay.style.zIndex = '1000'
    return overlay
}
export function Create_Modal_Container(): HTMLDivElement {
    const container = document.createElement('div')
    
    container.style.backgroundColor = 'white'
    container.style.padding = '20px'
    container.style.borderRadius = '8px'
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '8px'
    container.style.minWidth = '300px'
    container.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)'
    return container

}
export function Add_Schema_Modal_Association(
    button: HTMLButtonElement,
    api_url: string,
    selection: Selection,
    div: HTMLDivElement,
    state: Schema, 
    select: HTMLSelectElement
) {
    button.addEventListener('click', async function() {
        const graphql_schema = await Create_Schema_Modal(api_url)
        
        if (graphql_schema) {
            const schema = Convert_GraphQL_Schema_To_Schema(graphql_schema)
            const input_view = Render_Schema_Option(select,
                div,
                schema, selection, state
            )
            Connect_Input_View_To_State(input_view.input, state, schema, selection)
            
        }
        
    }
    )
}
export function Add_Schema_Modal_Element(
    button: HTMLButtonElement,
    api_url: string,
    client_url: string,
    div: HTMLDivElement,
    state: Schema,
) {
    button.addEventListener('click', async function () {
        let index = 0
        if (state.elements) {
            index = state.elements.length + 1 //increment
        }
        const schema_element = await Create_Schema_Element_Modal(api_url, index)
        /**
         * challenge: This function is just used for elements, but the function its calling is not, so I need to get the extra data
         * 
         */
        if (schema_element) {
            Create_Schema_Element(
                schema_element,
                state,
                div,
                client_url
            )
            if (!state.elements) {
                state.elements = []
            }
            state.elements.push(schema_element)
        }

    }
    )
}
export async function Make_Searchable_Select_Schema(
    button: HTMLButtonElement,
    schemas: Schema[],
    div: HTMLDivElement,
    state: Schema,
    selection: Selection,
    select: HTMLSelectElement
)  {
    select.size = 10;
    select.style.display = 'none'
    button.onclick = () => {
        if (select.style.display = 'none') {
            select.style.display = 'revert'
        } else {
            select.style.display = 'none'
        }
      
        const container = Create_Modal_Container()
        const overlay = Create_Modal_Overlay()


       
        const search_input = document.createElement('input');
        search_input.type = 'text';
        search_input.placeholder = 'Search...';
        const element_label: HTMLParagraphElement = document.createElement('p') as HTMLParagraphElement
    
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
            search_input.style.display = 'none';
            overlay.style.display = 'none'
            const input_view = Render_Schema_Option(select,
                div,
                schema, selection, state
            )
            Connect_Input_View_To_State(input_view.input, state, schema, selection)

            
        })
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            // If click is outside both the input and the select, hide the select
            if (target !== search_input && !select.contains(target) ) {
                select.style.display = 'none';
                // overlay.remove()
            }
        });
        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                overlay.remove()
            }
        })
        container.appendChild(search_input);
        container.appendChild(select);
        container.appendChild(element_label)
        overlay.appendChild(container)
        document.body.appendChild(overlay)
        
    }
}

export function Render_Schema_Option(
    select: HTMLSelectElement,
    container: HTMLDivElement,
    schema: Schema,
    selection: Selection,
    state: Schema
): Input_Viewer {

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
    div.appendChild(input_view.input)
    div.appendChild(viewer_element)
    const delete_button = document.createElement('button')
    delete_button.textContent = 'x'
    Make_Delete_Function_Association(
        div, delete_button, state,
        selection, schema.uid!
    )
    div.appendChild(delete_button)
    container.appendChild(div)
    return {'input': input_view.input, 'viewer': viewer_element}
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





export function resolveValue<T extends Data_Type>(
    schema: Schema<T>,
    raw_value: string
): Schema_Value<Schema<T>> {
    switch (schema.data_type) {
        case 'String':
            return raw_value as Schema_Value<Schema<T>>

        case 'Number':
            return Number(raw_value) as Schema_Value<Schema<T>>

        case 'Boolean':
            return (raw_value === 'true') as Schema_Value<Schema<T>>

        case 'Composite':
            throw new Error(
                'A Composite schema cannot be resolved from one input value.'
            )

        default:
            throw new Error(
                `Unsupported data type: ${schema.data_type}`
            )
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
    if (data_type === 'Composite') {
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



 export async function Handle_Data_Type_Select(
    select: HTMLSelectElement,
    schemas: Schema[],
    container: HTMLDivElement,
    constraint_container: HTMLDivElement, 
    state: Schema,
    client_url: string
    ) {
    select.value = ''
    const data_types: Data_Type[]= ['String',
        'Number',
        'Boolean',
        'Composite',
    ] as const
    // select.addEventListener('input', async function() {
        
        if (state.data_type == 'Composite') {
            // const select = await Make_Searchable_Select(schemas,
            //     container, state, client_url
            // )
            Connect_Select_To_List_State(select, state, 'elements')

            // Handle_Create_New_Schema(container, data_types, state, container)

        }
        if (state.data_type === 'String' ||
            state.data_type === 'Number'
        ) {
            Add_Schema_Constraints_UI(state.data_type, constraint_container)

        }
    // })
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
export function Render_Search_Schema_Value_Recursive(
    schema: Schema,
    target_container: HTMLDivElement,
    parents: Schema[] = [],
    ancestry_level_visible?: number,
    rendered_values: Rendered_Search_Value[] = []
): Rendered_Search_Value[] {

    const is_container =
        schema.data_type === 'Composite' 

    if (!is_container) {
        const context_div =
            Render_Parent_Context(
                parents,
                ancestry_level_visible
            )

        const label =
            Make_Schema_Label(schema)

        const input_view =
            Make_Schema_Input_View(schema)

        target_container.appendChild(context_div)
        target_container.appendChild(label)
        target_container.appendChild(input_view.container)

        rendered_values.push({
            schema,
            input: input_view.input,
            parents
        })

        return rendered_values
    }

    schema.elements?.forEach(child => {
        Render_Search_Schema_Value_Recursive(
            child.element,
            target_container,
            [...parents, schema],
            ancestry_level_visible,
            rendered_values
        )
    })

    return rendered_values
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
        schema.data_type === 'Composite' 
    ) {
        console.log(`callling render schema value recursive`)
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
    container: HTMLElement,
    element: Schema_Element,
    delete_button: HTMLButtonElement,
    State: Schema
) {
    delete_button.type = 'button'
    delete_button.addEventListener("click", () => {

        // Find the schema whose name matches the text

        State.elements!.splice(State.elements!.indexOf(element), 1);   // remove the schema

        // Remove DOM elements
        container.remove();
        delete_button.remove();
        console.log(`state after deleting ${JSON.stringify(State)}`)
    });
}

export function Make_Delete_Function_Association(
    element: HTMLElement,
    delete_button: HTMLButtonElement,
    state: Schema,
    key: Selection,
    schema_uid: string
) {
    delete_button.addEventListener('click', () => {
        const associations = state[key]
        console.log('key:', JSON.stringify(key))
        console.log('state in function:', state)
        console.log('State[key]:', state[key])
        if (!associations) {
            console.log(`No ${key} found on schema.`)
            return
        }

        const index = associations.findIndex(
            association => association.schema.uid === schema_uid
        )

        if (index === -1) {
            console.log(
                `Could not find ${key} association with uid ${schema_uid}`
            )
            return
        }

        associations.splice(index, 1)

        console.log(`Removed ${key} association at index ${index}`)

        element.remove()
        delete_button.remove()
    })
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
    parent_container: HTMLDivElement,
    client_url: string
) {
    const name = Make_Bold_P_Element(schema.name)
    const div = document.createElement('div')
    parent_container.appendChild(name)
    const edit_link: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    edit_link.href = `${client_url}/Schema/Definition/${schema.uid}`
    edit_link.textContent = `Edit ${schema.name}`
    parent_container.appendChild(edit_link)
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
                child.element,
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
    state: Schema_Instance,
    client_url: string ) {
    for (const [index, item] of current_schemas.entries()) {
        item.element.addEventListener('click', function() {
            current_schema_div.replaceChildren()
            current_instance_div.replaceChildren()
            Render_Schema_MetaData(item.schema, current_schema_div, client_url)
            Render_Adjacent_Elements(
                index, current_schemas, previous_button, next_button,
                current_schema_div,
                current_instance_div,
                state, client_url
            )
            console.log(`calling handle schema input rendering`)
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
    client_url: string
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
        previous?.path ?? [],
        client_url
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
        next?.path ?? [],
        client_url
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
    path: number[],
    client_url: string
) {
    button.textContent = schema ? schema.name : '—'
    button.disabled = schema === null
  
    // Replaces any existing handler — no accumulation
    button.onclick = () => {
        if (!schema) return
        current_schema_div.replaceChildren()
        Render_Schema_MetaData(schema, current_schema_div, client_url)
        Render_Adjacent_Elements(
            target_index,
            current_schemas,
            previous_button,
            next_button,
            current_schema_div,
            current_instance_div,
            state, client_url
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
export async function Send_Post_Request<
    Request_composite,
    Response_composite
>(
    path_url: string,
    data: Request_composite,
): Promise<Response_composite> {

    const token = localStorage.getItem('token')
    console.log(localStorage.getItem('token'))
    const Response = await fetch(path_url, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',

            ...(token
                ? {
                    Authorization: `Bearer ${token}`
                }
                : {})
        },
        body: JSON.stringify(data)
    })

    return await Response.json() as Response_composite
}

export function Convert_GraphQL_Schema_To_Schema(
    graphql_schema: GraphQL_Schema
): Schema {
    const schema: Schema = {
        uid: graphql_schema.uid,
        name: graphql_schema.name,
        data_type: graphql_schema.data_type,

        elements: graphql_schema.elements?.map(element => ({
            element: Convert_GraphQL_Schema_To_Schema(element.element),
            required: element.required,
            index: element.index,
            cardinality: element.cardinality
        })),

        properties: graphql_schema.properties?.map(association => ({
            schema: Convert_GraphQL_Schema_To_Schema(association.schema),
            value: association.value as any
        })),

        identifiers: graphql_schema.identifiers?.map(association => ({
            schema: Convert_GraphQL_Schema_To_Schema(association.schema),
            value: association.value as any
        })),

        rules: graphql_schema.rules,
        logic: graphql_schema.logic,
        relationships: graphql_schema.relationships,

        constraints: graphql_schema.constraints as any,

        enumerations: graphql_schema.enumerations as any,
        options: graphql_schema.options as any
    }

    return schema
}

export async function Get_All_Schemas(
    api_url: string
): Promise<GraphQL_Schema[]> {

    const response =
        await Send_Post_Request<
            { query: string },
            GraphQL_Response<Schemas_Query_Response>
        >(
            api_url,
            {
                query: `
                    query {
                        schemas {
                            uid
                            name
                            data_type
                        }
                    }
                `
            },
        )

    if (response.errors) {
        throw new Error(
            response.errors
                .map(error => error.message)
                .join('\n')
        )
    }

    return response.data.schemas
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