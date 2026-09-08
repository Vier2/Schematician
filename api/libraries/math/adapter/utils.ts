import type { 
    GraphQL_Instance,
    Math_Protocol_Node,
    Math_Protocol_Operation,
    GraphQL_Composite_Instance,
    Math_Operation_Node,
    GraphQL_Atomic_Instance,
    Operation_Definition
 } from "@schematician/shared"
import { is_variable_instance
    
 } from "../objectives/subsitition/utils.js"
import { 
    create_operation_application_instance,
    create_operation_argument_instance

} from "../operation/utils.js"
 import { Addition_Operation, 
    Subtraction_Operation,
    Operation_Application_Schema, 
    Multiplication_Operation,
    Division_Operation} from "../operation/utils.js"
 import { get_operation_uid } from "../objectives/expand/utils.js"
import { Power_Operation } from "../schema.js"
import { clone_instance } from "../objectives/subsitition/utils.js"

import { 
    create_addition,
    create_multiplication

 } from "../objectives/expand/utils.js"
import { Number_Schema, Variable_Name_Schema, Variable_Schema } from "../object.js"

function map_operation_uid_to_protocol(
    uid: string,
    addition_operation = Addition_Operation,
    substraction_operation = Subtraction_Operation,
    multiplication_operation = Multiplication_Operation,
    division_operation = Division_Operation,
    power_operation = Power_Operation
): Math_Protocol_Operation {

    switch (uid) {

        case addition_operation.uid:
            return 'Add'

        case substraction_operation.uid:
            return 'Subtract'

        case multiplication_operation.uid:
            return 'Multiply'

        case division_operation.uid:
            return 'Divide'

        case power_operation.uid:
            return 'Power'

        default:

            throw new Error(
                `Unsupported operation: ${uid}`
            )
    }
}
export function get_composite_child(
    instance:
        GraphQL_Composite_Instance,

    element_relationship_uid:
        string
): GraphQL_Instance | undefined {

    return instance.objects.find(
        object =>
            object.element_relationship_uid ===
            element_relationship_uid
    )?.instance
}

function get_operation_application_values(
    operation:
        GraphQL_Composite_Instance

): GraphQL_Instance[] {

    const operationArguments =
        get_composite_child(
            operation,
            'arguments'
        )

    if (
        !operationArguments ||
        operationArguments.data_type !== 'Array'
    ) {
        return []
    }


    const values:
        GraphQL_Instance[] = []


    for (
        const argument
        of operationArguments.items
    ) {

        if (
            argument.data_type !==
            'Composite'
        ) {
            continue
        }


        const value =
            get_composite_child(
                argument,
                'value'
            )


        if (!value) {
            continue
        }


        if (
            value.data_type ===
            'Array'
        ) {

            values.push(
                ...value.items
            )
        }

        else {

            values.push(
                value
            )
        }
    }


    return values
}
export function get_variable_name(
    variable:
        GraphQL_Composite_Instance,
): string {

    if (
        variable.schema_uid !==
        Variable_Schema.uid
    ) {
        throw new Error(
            `Instance ${variable.uid} is not a Variable.`
        )
    }


    const name =
        get_composite_child(
            variable,
            'name'
        )


    if (
        !name ||
        name.data_type !== 'String' ||
        typeof name.value !== 'string'
    ) {
        throw new Error(
            `Variable ${variable.uid} has no valid name.`
        )
    }


    return name.value
}


export function create_variable_instance(
    uid: string,
    name: string,
    variable_schema = Variable_Schema,
    variable_name_schema = Variable_Name_Schema
): GraphQL_Composite_Instance {

    const name_instance:
        GraphQL_Atomic_Instance = {

        uid:
            `${uid}.name`,

        schema_uid:
            variable_name_schema.uid!,

        data_type:
            'String',

        value:
            name
    }


    return {
        uid,

        schema_uid:
            variable_schema.uid!,

        data_type:
            'Composite',

        objects: [
            {
                element_relationship_uid:
                    'name',

                instance:
                    name_instance
            }
        ]
    }
}
export function create_number_instance(
    uid: string,
    value: number,
    number_schema = Number_Schema
): GraphQL_Atomic_Instance {

    return {
        uid,

        schema_uid:
            number_schema.uid!,

        data_type:
            'Number',

        value
    }
}


export function schematician_to_math_protocol(
    instance:
        GraphQL_Instance,
    operation_application_schema =  Operation_Application_Schema

): Math_Protocol_Node {

    if (
        instance.data_type === 'Number'
    ) {

        if (
            typeof instance.value !==
            'number'
        ) {
            throw new Error(
                'Uninitialized Number cannot be converted.'
            )
        }

        return {
            type:
                'Number',

            value:
                instance.value
        }
    }


    if (
        is_variable_instance(
            instance
        )
    ) {

        const name =
            get_variable_name(
                instance
            )

        return {
            type:
                'Symbol',

            uid:
                instance.uid,

            name
        }
    }


    const composite_instance =
    instance as GraphQL_Composite_Instance

    if (
        composite_instance.data_type === 'Composite' &&

        composite_instance.schema_uid ===
        operation_application_schema.uid
    ) {

        const operation_uid =
            get_operation_uid(
                composite_instance
            )

        if (!operation_uid) {
            throw new Error(
                'Operation application has no operation UID.'
            )
        }


        return {
            type:
                'Operation',

            operation:
                map_operation_uid_to_protocol(
                    operation_uid
                ),

            arguments:
                get_operation_application_values(
                    composite_instance
                )
                    .map(
                        schematician_to_math_protocol
                    )
        }
    }


    throw new Error(
        `Unsupported mathematical object: ${instance.schema_uid
        }`
    )
}
export function math_protocol_to_schematician(
    node:
        Math_Protocol_Node,

    variable_registry:
        Map<
            string,
            GraphQL_Composite_Instance
        >,

    uid_prefix:
        string

): GraphQL_Instance {

    switch (node.type) {

        case 'Number':

            return create_number_instance(
                `${uid_prefix}.number`,
                node.value
            )


        case 'Symbol': {

            const existing =
                variable_registry.get(
                    node.uid
                )

            if (existing) {
                return clone_instance(
                    existing
                )
            }


            return create_variable_instance(
                node.uid,
                node.name
            )
        }

        case 'Operation':

            return protocol_operation_to_schematician(
                node,
                variable_registry,
                uid_prefix
            )
    }
}

export function create_binary_operation(
    uid: string,

    operation:
        Operation_Definition,

    left_input_uid:
        string,

    left:
        GraphQL_Instance,

    right_input_uid:
        string,

    right:
        GraphQL_Instance
): GraphQL_Composite_Instance {

    const left_argument =
        create_operation_argument_instance(
            `${uid}.argument.${left_input_uid}`,

            left_input_uid,

            left
        )


    const right_argument =
        create_operation_argument_instance(
            `${uid}.argument.${right_input_uid}`,

            right_input_uid,

            right
        )


    return create_operation_application_instance(
        uid,

        operation,

        [
            left_argument,
            right_argument
        ]
    )
}

function protocol_operation_to_schematician(
    node:
        Math_Operation_Node,

    variables:
        Map<string, GraphQL_Composite_Instance>,

    uid:
        string

): GraphQL_Composite_Instance {

    const args =
        node.arguments.map(
            (argument, index) =>
                math_protocol_to_schematician(
                    argument,
                    variables,
                    `${uid}.${index}`
                )
        )


    switch (node.operation) {

        case 'Add':

            return create_addition(
                `${uid}.addition`,
                args
            )


        case 'Multiply':

            return create_multiplication(
                `${uid}.multiplication`,
                args
            )


        case 'Subtract':

            return create_binary_operation_application(
                `${uid}.subtraction`,
                Subtraction_Operation,
                'minuend',
                args[0],
                'subtrahend',
                args[1]
            )


        case 'Power':

            return create_binary_operation_application(
                `${uid}.power`,
                Power_Operation,
                'base',
                args[0],
                'exponent',
                args[1]
            )


        case 'Divide':

            return create_binary_operation_application(
                `${uid}.division`,
                Division_Operation,
                'dividend',
                args[0],
                'divisor',
                args[1]
            )
    }
}