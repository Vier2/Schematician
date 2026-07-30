import type { Schema, 
    Schema_Instance, Instance_Path, 
    GraphQL_Instance_Value,
    Create_Array_Item_Result,
    JSON_Value, GraphQL_Instance, GraphQL_Atomic_Instance, GraphQL_Array_Instance } from "@schematician/shared"
import type { Rendered_Node, Rendered_Search_Value } from "$lib/Schema/models"
import { Make_Bold_P_Element, 
    Apply_Hover_Highlight, Apply_Length_Value_CSS,
    Add_Flex_Style, Apply_Descending_Indentation,
    Make_Schema_Input_View, Make_Schema_Label
 } from "$lib/shared/utils"
import type { Update_Instance_Values_Response, 
    Remove_Array_Item_Response,
    Create_Array_Item_Input,
    Create_Array_Item_Response,
    Remove_Array_Item_Input,
    Save_Instance_Response, Save_Instance_Input, GraphQL_Field_Selection,
GraphQL_Inline_Fragment } from "$lib/graphql/types"
import { Send_GraphQL_Request, Build_Instance_Selection } from "$lib/graphql/utils"
import { json } from "@sveltejs/kit"
 

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
                            element_relationship_uid:
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
    api_url: string,
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
        const element_relationship_uids = schema.elements?.map(element => element.uid)
        console.log(`element relationship uids ${element_relationship_uids}`)
        console.log( `schema elements ${JSON.stringify(schema.elements?.length)}`)
        schema.elements?.forEach(
            schema_element => {
                console.log(`schema element in render node ${schema_element.element.name}`)
            
                Render_Schema_Node(
                    api_url,
                    schema_element.element,
                    parent,
                    depth + 1,
                    state,
                    [
                        ...path,
                        {
                            type: 'Object',
                            element_relationship_uid:
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
                        api_url,
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
            async function() {
                const {item_path} = await Add_Array_Item(
                    api_url,
                    state,    path)
                
                Render_Schema_Node(
                    api_url,
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



export async function Update_Instance_Values(
    client_url: string,
    root_instance_uid: string,
    values: GraphQL_Instance_Value[]
): Promise<GraphQL_Instance_Value[]> {
    const response =
        await fetch(
            client_url,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                credentials:
                    'include',

                body:
                    JSON.stringify({
                        query: `
                            mutation Update_Instance_Values(
                                $root_instance_uid: String!,
                                $values:
                                    [Instance_Value_Update_Input!]!
                            ) {
                                update_instance_values(
                                    root_instance_uid:
                                        $root_instance_uid,

                                    values:
                                        $values
                                ) {
                                    instance_uid
                                    schema_uid
                                    value
                                }
                            }
                        `,

                        variables: {
                            root_instance_uid,
                            values
                        }
                    })
            }
        )

    if (!response.ok) {
        throw new Error(
            [
                'Instance update request failed.',
                `HTTP status: ${response.status}.`
            ].join(' ')
        )
    }

    const result =
        await response.json()as Update_Instance_Values_Response

    if (
        result.errors &&
        result.errors.length > 0
    ) {
        throw new Error(
            result.errors
                .map(error => error.message)
                .join('\n')
        )
    }

    if (!result.data) {
        throw new Error(
            'The instance update returned no data.'
        )
    }

    return result.data
        .update_instance_values
}



export async function Save_Instance(
    api_url: string,
    instance: GraphQL_Instance
): Promise<GraphQL_Instance> {
    const result =
        await Send_GraphQL_Request<
            Save_Instance_Response,
            Save_Instance_Input
        >({
            api_url,

            operation_type:
                'mutation',

            operation_name:
                'Save_Instance',

            field_name:
                'save_instance',

            variables: [
                {
                    name:
                        'instance',

                    type:
                        'JSON!'
                }
            ],

            input_data: {
                instance
            },

            selection: [
                '__typename',

                {
                    fragment_on:
                        'Atomic_Instance',

                    selection: [
                        'uid',
                        'schema_uid',
                        'data_type',
                        'value'
                    ]
                },

                {
                    fragment_on:
                        'Composite_Instance',

                    selection: [
                        'uid',
                        'schema_uid',
                        'data_type'
                    ]
                },

                {
                    fragment_on:
                        'Array_Instance',

                    selection: [
                        'uid',
                        'schema_uid',
                        'data_type'
                    ]
                }
            ]
        })

    const saved_instance =
        result.save_instance

    if (!saved_instance) {
        throw new Error(
            [
                `Could not save instance "${instance.uid}".`,
                'The root instance was not found or is not owned by the current user.'
            ].join(' ')
        )
    }

    return instance
}
export function Collect_Instance_Values(
    instance: GraphQL_Instance,
    values: GraphQL_Instance_Value[] = []
): GraphQL_Instance_Value[] {
    if (
        instance.data_type === 'String' ||
        instance.data_type === 'Number' ||
        instance.data_type === 'Boolean'
    ) {
        values.push({
            instance_uid:
                instance.uid,

            schema_uid:
                instance.schema_uid,

            value:
                instance.value
        })

        return values
    }

    if (instance.data_type === 'Composite') {
        for (const object of instance.objects) {
            Collect_Instance_Values(
                object.instance,
                values
            )
        }

        return values
    }
    if (instance.data_type === 'Array') {
        for (const item of instance.items) {
            Collect_Instance_Values(
                item,
                values
            )
        }
    }

    return values
}
export function Add_Save_Instance_Function(
    button: HTMLButtonElement,
    state: Schema_Instance,
    api_url: string
): void {
    button.addEventListener(
        'click',
        async (): Promise<void> => {
            const original_text =
                button.textContent ??
                'Save'

            try {
                button.disabled = true
                button.textContent =
                    'Saving...'

                console.log(
                    'Saving instance state:',
                    state.root
                )

                console.log(
                    `instance before saving
                    ${JSON.stringify(state.root)}`
                )
                const result = await Save_Instance(
                    api_url,
                    state.root
                )
                console.log(`
                    saved instance ${result}`)
                button.textContent =
                    'Saved'
            } catch (error) {
                console.error(
                    'Could not save instance:',
                    error
                )

                button.textContent =
                    'Save failed'
            } finally {
                window.setTimeout(
                    () => {
                        button.disabled =
                            false

                        button.textContent =
                            original_text
                    },
                    1200
                )
            }
        }
    )
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
    api_url:string

) {
    console.log(`
        schema in add hiercahical elements ${JSON.stringify(top_level_schema)}`)
    return Render_Schema_Node(
        api_url,
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
                if (schema_element.uid != null) {

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
                                element_relationship_uid:
                                    schema_element.uid
                            }
                        ],
                        [...parents, schema],
                        ancestry_level_visible,
                        rendered_values
                    )
                }
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


export async function Remove_Array_Item(
    api_url: string,
    state: Schema_Instance,
    array_path: Instance_Path,
    item_index: number
): Promise<void> {
    const array_instance =
        Get_Instance_Node(
            state,
            array_path
        )

    if (
        array_instance.data_type !==
        'Array'
    ) {
        throw new Error(
            'Instance at the supplied path is not an array.'
        )
    }

    const item =
        array_instance.items[
        item_index
        ]

    if (!item) {
        throw new Error(
            `Array item index "${item_index}" does not exist.`
        )
    }

    const removed =
        await Request_Remove_Array_Item(
            api_url,
            array_instance.uid,
            item.uid
        )

    if (!removed) {
        throw new Error(
            `Could not remove array item "${item.uid}".`
        )
    }

    /*
     * Change local state only after the server succeeds.
     */
    array_instance.items.splice(
        item_index,
        1
    )
}

export async function Request_Remove_Array_Item(
    api_url: string,
    array_instance_uid: string,
    item_instance_uid: string
): Promise<boolean> {
    const result =
        await Send_GraphQL_Request<
            Remove_Array_Item_Response,
            Remove_Array_Item_Input
        >({
            api_url,

            operation_type:
                'mutation',

            operation_name:
                'Remove_Array_Item',

            field_name:
                'remove_array_item',

            variables: [
                {
                    name:
                        'array_instance_uid',

                    type:
                        'String!'
                },

                {
                    name:
                        'item_instance_uid',

                    type:
                        'String!'
                }
            ],

            input_data: {
                array_instance_uid,
                item_instance_uid
            },

            /*
             * Your current Send_GraphQL_Request always places a
             * selection set after the field. GraphQL scalar fields
             * cannot have selection sets.
             *
             * This issue is addressed in section 13.
             */
            selection: []
        })

    return result.remove_array_item
}
export async function Add_Array_Item(
    api_url: string,
    state: Schema_Instance,
    array_path: Instance_Path
): Promise<{
    item: GraphQL_Instance
    item_path: Instance_Path
    index: number
}> {
    const array_instance =
        Get_Instance_Node(
            state,
            array_path
        )

    if (
        array_instance.data_type !==
        'Array'
    ) {
        throw new Error(
            'Instance at the supplied path is not an array.'
        )
    }

    const result =
        await Request_Create_Array_Item(
            api_url,
            array_instance.uid
        )

    if (!Array.isArray(array_instance.items)) {
        array_instance.items = []
    }

    /*
     * New server-created items are appended.
     *
     * Do not construct a sparse client array based on a database
     * relationship index.
     */
    array_instance.items.push(
        result.item
    )

    const local_index =
        array_instance.items.length - 1

    const item_path: Instance_Path = [
        ...array_path,
        {
            type:
                'Array_Item',

            index:
                local_index
        }
    ]

    return {
        item:
            result.item,

        item_path,

        index:
            local_index
    }
}

export async function Request_Create_Array_Item(
    api_url: string,
    array_instance_uid: string
): Promise<Create_Array_Item_Result> {
    const result =
        await Send_GraphQL_Request<
            Create_Array_Item_Response,
            Create_Array_Item_Input
        >({
            api_url,

            operation_type:
                'mutation',

            operation_name:
                'Create_Array_Item',

            field_name:
                'create_array_item',

            variables: [
                {
                    name:
                        'array_instance_uid',

                    type:
                        'String!'
                }
            ],

            input_data: {
                array_instance_uid
            },

            selection: [
                'index',

                {
                    field:
                        'item',

                    selection:
                        Build_Instance_Selection(
                            5
                        )
                }
            ]
        })

    return result.create_array_item
}
export function Get_Instance_Node(
    state: Schema_Instance,
    path: Instance_Path
): GraphQL_Instance {
    let current_instance =
        state.root
    console.log(
        `Instance path ${JSON.stringify(path)}`
    )
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
            const object = segment.element_relationship_uid != null
                ? current_instance.objects.find(
                    current_object =>
                        current_object.element_relationship_uid === segment.element_relationship_uid
                )
                : undefined;

            if (segment.element_relationship_uid === null) {
                continue
            }
            if (!object) {
                throw new Error(
                    [
                        'Composite instance',
                        current_instance.uid,
                        `does not contain has object relationship with a key of
                        element_relationship = ${segment.element_relationship_uid}the schema s has element relationship uid 
                        `,
                        segment.element_relationship_uid
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