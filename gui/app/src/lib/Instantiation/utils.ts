import type { Instance_Node, Schema, 
    Schema_Instance, Instance_Path, 
    JSON_Value, GraphQL_Instance, GraphQL_Atomic_Instance } from "@schematician/shared"
import type { Rendered_Node, Rendered_Search_Value } from "$lib/Schema/models"
import { Make_Bold_P_Element, 
    Apply_Hover_Highlight, Apply_Length_Value_CSS,
    Add_Flex_Style, Apply_Descending_Indentation,
    Make_Schema_Input_View, Make_Schema_Label
 } from "$lib/shared/utils"


 

function Link_State(
    element:
        | HTMLInputElement
        | HTMLSelectElement,

    state: Schema_Instance,
    path: Instance_Path
): JSON_Value | null {
    const stable_path =
        path.map(segment => ({
            ...segment
        }))

    const instance =
        Get_Instance_Node(
            state,
            stable_path
        )

    if (
        instance.data_type === 'Composite' ||
        instance.data_type === 'Array'
    ) {
        throw new Error(
            [
                'Link_State requires an atomic',
                'instance, but received',
                instance.data_type
            ].join(' ')
        )
    }

    element.value =
        instance.value === null
            ? ''
            : String(instance.value)

    const event_type =
        element instanceof HTMLSelectElement
            ? 'change'
            : 'input'

    element.addEventListener(
        event_type,
        () => {
            const next_value =
                Convert_Input_Value(
                    instance,
                    element
                )

            Set_Instance_Value(
                state,
                stable_path,
                next_value
            )
        }
    )

    return instance.value
}
function Convert_Input_Value(
    instance: GraphQL_Atomic_Instance,
    input: HTMLInputElement | HTMLSelectElement
): JSON_Value {
    switch (instance.data_type) {
        case 'String':
            return input.value

        case 'Number': {
            if (input.value.trim() === '') {
                return null
            }

            const number_value =
                Number(input.value)

            if (Number.isNaN(number_value)) {
                throw new Error(
                    `"${input.value}" is not a valid number.`
                )
            }

            return number_value
        }

        case 'Boolean':
            return input.value === 'true'

        default: {
            const exhaustive_check =
                instance

            throw new Error(
                `Unsupported atomic instance: ${JSON.stringify(
                    exhaustive_check
                )}`
            )
        }
    }
}
export function Link_Schema_Input_View_To_State(
    input:
        | HTMLInputElement
        | HTMLSelectElement,

    state: Schema_Instance,
    path: Instance_Path
): void {
    if (!input) {
        return
    }

    Link_State(
        input,
        state,
        path
    )
}

export function Render_Search_Schema_Value_Recursive(
    schema: Schema,
    target_container: HTMLDivElement,
    state: Schema_Instance,
    path: Instance_Path = [],
    parents: Schema[] = [],
    ancestry_level_visible?: number,
    rendered_values: Rendered_Search_Value[] = []
): Rendered_Search_Value[] {
    if (
        schema.data_type === 'String' ||
        schema.data_type === 'Number' ||
        schema.data_type === 'Boolean'
    ) {
        const context_div =
            Render_Parent_Context(
                parents,
                ancestry_level_visible
            )

        const label =
            Make_Schema_Label(schema)

        const input_view =
            Make_Schema_Input_View(schema)

        Link_Schema_Input_View_To_State(
            input_view.input,
            state,
            path
        )

        target_container.appendChild(
            context_div
        )

        target_container.appendChild(
            label
        )

        target_container.appendChild(
            input_view.container
        )

        rendered_values.push({
            schema,
            input: input_view.input,
            parents,
            path
        })

        return rendered_values
    }

    const instance =
        Get_Instance_Node(
            state,
            path
        )

    if (schema.data_type === 'Composite') {
        if (
            instance.data_type !==
            'Composite'
        ) {
            throw new Error(
                `Expected a composite instance for ${schema.name}.`
            )
        }

        schema.elements?.forEach(
            schema_element => {
             
                Render_Search_Schema_Value_Recursive(
                    schema_element.element,
                    target_container,
                    state,
                    [
                        ...path,
                        {
                            type: 'Object',
                            schema_element_uid:
                                schema_element.uid!
                        }
                    ],
                    [...parents, schema],
                    ancestry_level_visible,
                    rendered_values
                )
            }
        )

        return rendered_values
    }

    if (instance.data_type !== 'Array') {
        throw new Error(
            `Expected an array instance for ${schema.name}.`
        )
    }

    const item_schema =
        schema.elements?.[0]?.element

    if (!item_schema) {
        return rendered_values
    }

    instance.items.forEach(
        (_item, item_index) => {
            Render_Search_Schema_Value_Recursive(
                item_schema,
                target_container,
                state,
                [
                    ...path,
                    {
                        type: 'Array_Item',
                        index: item_index
                    }
                ],
                [...parents, schema],
                ancestry_level_visible,
                rendered_values
            )
        }
    )

    return rendered_values
}
export function Render_Schema_Node(
    schema: Schema,
    parent: HTMLElement,
    depth: number,
    state: Schema_Instance,
    path: Instance_Path = [],
    list: Rendered_Node[] = [],
    on_node_created?: (
        rendered_node: Rendered_Node,
        index: number
    ) => void
): Rendered_Node[] {
    const row =
        document.createElement('div')

    Add_Flex_Style(row, 'row')

    Apply_Length_Value_CSS(
        row,
        'gap',
        '%',
        3
    )

    Apply_Length_Value_CSS(
        row,
        'marginLeft',
        'px',
        depth * 20
    )

    const label =
        Make_Bold_P_Element(
            schema.name
        )

    Apply_Hover_Highlight(
        label,
        'red'
    )

    row.appendChild(label)
    parent.appendChild(row)

    const rendered_node: Rendered_Node = {
        schema,
        element: label,
        path: [...path]
    }

    list.push(rendered_node)

    on_node_created?.(
        rendered_node,
        list.length - 1
    )

    const instance =
        Get_Instance_Node(
            state,
            path
        )
    console.log(`instance ${JSON.stringify(instance)}`)
    if (schema.data_type === 'Composite') {
        if (
            instance.data_type !==
            'Composite'
        ) {
            throw new Error(
                `Schema and instance data types do not match for ${schema.name}.`
            )
        }

        schema.elements?.forEach(
            schema_element => {
                console.log(`schema element in render node ${schema_element.element.name}`)
                Render_Schema_Node(
                    schema_element.element,
                    parent,
                    depth + 1,
                    state,
                    [
                        ...path,
                        {
                            type: 'Object',
                            schema_element_uid:
                                schema_element.uid!
                        }
                    ],
                    list,
                    on_node_created
                )
            }
        )

        return list
    }

    if (schema.data_type === 'Array') {
        if (
            instance.data_type !==
            'Array'
        ) {
            throw new Error(
                `Schema and instance data types do not match for ${schema.name}.`
            )
        }

    
        const item_schema =
            schema.elements?.[0]?.element

        if (!item_schema) {
            throw new Error(
                `Array schema ${schema.name} has no item schema.`
            )
        }

        /*
         * Render already-existing items.
         */

        if (instance.items) {
            instance.items.forEach(
                (_item, item_index) => {
                    Render_Schema_Node(
                        item_schema,
                        parent,
                        depth + 1,
                        state,
                        [
                            ...path,
                            {
                                type: 'Array_Item',
                                index: item_index
                            }
                        ],
                        list,
                        on_node_created
                    )
                }
            )

        }

        const add_instance_button =
            document.createElement('button')

        add_instance_button.textContent = '+'

        row.appendChild(
            add_instance_button
        )

        add_instance_button.addEventListener(
            'click',
            () => {
                const {
                    item_path
                } = Add_Array_Item(
                    state,
                    schema,
                    path
                )

                Render_Schema_Node(
                    item_schema,
                    parent,
                    depth + 1,
                    state,
                    item_path,
                    list,
                    on_node_created
                )
               
            }
        )
    }

    return list
}

export function Add_Event_To_Map_Element(
    item: Rendered_Node,
    index: number,
    current_schema_div: HTMLDivElement,
    current_schemas: Rendered_Node[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_instance_div: HTMLDivElement,
    state: Schema_Instance,
    client_url: string
): void {
    item.element.addEventListener(
        'click',
        () => {
            current_schema_div
                .replaceChildren()

            current_instance_div
                .replaceChildren()

            Render_Schema_MetaData(
                item.schema,
                current_schema_div,
                client_url
            )

            Render_Adjacent_Elements(
                index,
                current_schemas,
                previous_button,
                next_button,
                current_schema_div,
                current_instance_div,
                state,
                client_url
            )

            Handle_Schema_input_rendering(
                item.schema,
                current_instance_div,
                state,
                item.path
            )
        }
    )
}
export function Handle_Schema_input_rendering(
    schema: Schema,
    div: HTMLDivElement,
    state: Schema_Instance,
    path: Instance_Path
) {
    div.replaceChildren()

    if (
        schema.data_type === 'Composite' ||
        schema.data_type === 'Array'
    ) {
        Render_Schema_Value_Recursive(
            schema,
            div,
            state,
            path,
            
        )

        return
    }

    const input_view =
        Make_Schema_Input_View(schema)

    Link_Schema_Input_View_To_State(
        input_view.input,
        state,
        path
    )

    div.appendChild(
        input_view.container
    )
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
    path: Instance_Path,
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

export function Add_Event_Map_Elements(
    current_schema_div: HTMLDivElement,
    current_schemas: Rendered_Node[],
    previous_button: HTMLButtonElement,
    next_button: HTMLButtonElement,
    current_instance_div: HTMLDivElement,
    state: Schema_Instance,
    client_url: string
): void {
    current_schemas.forEach(
        (item, index) => {
            Add_Event_To_Map_Element(
                item,
                index,
                current_schema_div,
                current_schemas,
                previous_button,
                next_button,
                current_instance_div,
                state,
                client_url
            )
        }
    )
}

export function Add_Save_Instance_Function(
    button: HTMLButtonElement,
    state: Schema_Instance
) {
    button.addEventListener('click', function() {
        console.log(`Instance State ${JSON.stringify(state)}`)
    })
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

export function Add_Hierarchical_Elements(
    map_div: HTMLDivElement,
    top_level_schema: Schema,
    state: Schema_Instance,

) {
    console.log(`
        schema in add hiercahical elements ${JSON.stringify(top_level_schema)}`)
    return Render_Schema_Node(
        top_level_schema,
        map_div,
        0,
        state

    )
}

export function Set_Instance_Value(
    state: Schema_Instance,
    path: Instance_Path,
    value: JSON_Value
): void {
    const instance =
        Get_Instance_Node(
            state,
            path
        )

    if (
        instance.data_type === 'Composite' ||
        instance.data_type === 'Array'
    ) {
        throw new Error(
            [
                'Cannot assign an atomic value to',
                `${instance.data_type} instance`,
                instance.uid
            ].join(' ')
        )
    }

    instance.value = value
}
export function Render_Schema_Value_Recursive(
    schema: Schema,
    target_container: HTMLDivElement,
    state: Schema_Instance,
    path: Instance_Path = [],
    parents: Schema[] = [],
    ancestry_level_visible?: number,
    rendered_values: Rendered_Search_Value[] = []
): Rendered_Search_Value[] {
    if (
        schema.data_type === 'String' ||
        schema.data_type === 'Number' ||
        schema.data_type === 'Boolean'
    ) {
        const context_div =
            Render_Parent_Context(
                parents,
                ancestry_level_visible
            )

        const label =
            Make_Schema_Label(schema)

        const input_view =
            Make_Schema_Input_View(schema)

        Link_Schema_Input_View_To_State(
            input_view.input,
            state,
            path
        )

        target_container.appendChild(
            context_div
        )

        target_container.appendChild(
            label
        )

        target_container.appendChild(
            input_view.container
        )

        rendered_values.push({
            schema,
            input: input_view.input,
            parents,
            path
        })

        return rendered_values
    }
    const instance =
        Get_Instance_Node(
            state,
            path
        )

    if (schema.data_type === 'Composite') {
        if (
            instance.data_type !==
            'Composite'
        ) {
            throw new Error(
                `Expected a composite instance for ${schema.name}.`
            )
        }

        schema.elements?.forEach(
            schema_element => {
                console.log({
                    composite_schema: schema.name,
                    element_schema: schema_element.element.name,
                    schema_element_uid:
                        schema_element.uid,
                    current_path: path
                })
                Render_Schema_Value_Recursive(
                    schema_element.element,
                    target_container,
                    state,
                    [
                        ...path,
                        {
                            type: 'Object',
                            schema_element_uid:
                                schema_element.uid!
                        }
                    ],
                    [...parents, schema],
                    ancestry_level_visible,
                    rendered_values
                )
            }
        )

        return rendered_values
    }

    if (instance.data_type !== 'Array') {
        throw new Error(
            `Expected an array instance for ${schema.name}.`
        )
    }

    const item_schema =
        schema.elements?.[0]?.element

    if (!item_schema) {
        return rendered_values
    }

    if (instance.items) {

        instance.items.forEach(
            (_item, item_index) => {
                Render_Schema_Value_Recursive(
                    item_schema,
                    target_container,
                    state,
                    [
                        ...path,
                        {
                            type: 'Array_Item',
                            index: item_index
                        }
                    ],
                    [...parents, schema],
                    ancestry_level_visible,
                    rendered_values
                )
            }
        )
    }

    return rendered_values
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
export function Create_Instance_State(
    schema: Schema
): Schema_Instance {
    return {
        schema,
        root: Create_Instance_Node(schema)
    }
}

export function Create_Instance_Node(
    schema: Schema
): GraphQL_Instance {
    if (!schema.uid) {
        throw new Error(
            `Cannot create an instance for schema "${schema.name}" because the schema has no UID.`
        )
    }

    const base = {
        uid: crypto.randomUUID(),
        schema_uid: schema.uid
    }

    switch (schema.data_type) {
        case 'String':
        case 'Number':
        case 'Boolean':
            return {
                ...base,
                data_type: schema.data_type,
                value: null
            }

        case 'Composite':
            return {
                ...base,
                data_type: 'Composite',
                objects:
                    schema.elements?.map(
                        schema_element => ({
                            element_relationship_uid:
                                schema_element.uid!,
                            instance:
                                Create_Instance_Node(
                                    schema_element.element
                                )
                        })
                    ) ?? []
            }

        case 'Array': {
            const item_schema_element =
                schema.elements?.[0]

            if (!item_schema_element) {
                throw new Error(
                    `Array schema "${schema.name}" has no item schema.`
                )
            }

            if (schema.elements?.length !== 1) {
                throw new Error(
                    `Array schema "${schema.name}" must contain exactly one item schema.`
                )
            }

            return {
                ...base,
                data_type: 'Array',
                items: [
                    Create_Instance_Node(
                        item_schema_element.element
                    )
                ]
            }
        }

        default: {
            const exhaustive_check: never =
                schema.data_type

            throw new Error(
                `Unsupported schema data type: ${exhaustive_check}`
            )
        }
    }
}
export function Add_Array_Item(
    state: Schema_Instance,
    array_schema: Schema,
    array_path: Instance_Path
): {
    item: GraphQL_Instance
    item_path: Instance_Path
    index: number
} {
    const array_instance =
        Get_Instance_Node(
            state,
            array_path
        )

    if (array_instance.data_type !== 'Array') {
        throw new Error(
            `Instance at the supplied path is not an array.`
        )
    }

    const item_schema_element =
        array_schema.elements?.[0]

    if (!item_schema_element) {
        throw new Error(
            `Array schema ${array_schema.name} does not define an item schema.`
        )
    }

    if (
        array_schema.elements?.length !== 1
    ) {
        throw new Error(
            `Array schema ${array_schema.name} must have exactly one item schema.`
        )
    }

    const item =
        Create_Instance_Node(
            item_schema_element.element
        )

    array_instance.items.push(item)

    const index =
        array_instance.items.length - 1

    const item_path: Instance_Path = [
        ...array_path,
        {
            type: 'Array_Item',
            index
        }
    ]

    return {
        item,
        item_path,
        index
    }
}
export function Get_Instance_Node(
    state: Schema_Instance,
    path: Instance_Path
): GraphQL_Instance {
    let current_instance =
        state.root

    for (const segment of path) {
        if (segment.type === 'Object') {
            if (
                current_instance.data_type !==
                'Composite'
            ) {
                throw new Error(
                    [
                        'Cannot enter a composite object',
                        `from a ${current_instance.data_type}`,
                        'instance.'
                    ].join(' ')
                )
            }

            const object =
                current_instance.objects.find(
                    current_object =>
                        current_object
                            .element_relationship_uid ===
                        segment.schema_element_uid
                )

            if (!object) {
                throw new Error(
                    [
                        'Composite instance',
                        current_instance.uid,
                        'does not contain schema element',
                        segment.schema_element_uid
                    ].join(' ')
                )
            }

            current_instance =
                object.instance

            continue
        }

        if (
            current_instance.data_type !==
            'Array'
        ) {
            throw new Error(
                [
                    'Cannot enter an array item',
                    `from a ${current_instance.data_type}`,
                    'instance.'
                ].join(' ')
            )
        }

        const item =
            current_instance.items[
            segment.index
            ]

        if (!item) {
            throw new Error(
                [
                    `Array instance ${current_instance.uid}`,
                    'does not contain an item at index',
                    String(segment.index)
                ].join(' ')
            )
        }

        current_instance = item
    }

    return current_instance
}
export function Get_Instance_Value(
    state: Schema_Instance,
    path: Instance_Path
): JSON_Value | null {
    const instance =
        Get_Instance_Node(
            state,
            path
        )

    if (
        instance.data_type === 'Composite' ||
        instance.data_type === 'Array'
    ) {
        throw new Error(
            [
                'Cannot read an atomic value from',
                `${instance.data_type} instance`,
                instance.uid
            ].join(' ')
        )
    }

    return instance.value
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