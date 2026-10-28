import type { 
    GraphQL_Instance,
    Math_Protocol_Node,
    Math_Protocol_Operation,
    GraphQL_Composite_Instance,
    Math_Operation_Node,
    GraphQL_Atomic_Instance,
    Operation_Definition,
    Schema
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
import {
    Equation_Schema,
    Number_Schema,
    Rational_Denominator_Schema,
    Rational_Numerator_Schema,
    Rational_Schema,
    normalize_rational,
    Variable_Name_Schema,
    Variable_Schema
} from "../object.js"

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

export function get_operation_application_values(
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

export function create_rational_instance(
    uid: string,
    numerator: number,
    denominator: number,
    rational_schema: Schema<'Composite'> = Rational_Schema,
    numerator_schema: Schema<'Number'> = Rational_Numerator_Schema,
    denominator_schema: Schema<'Number'> = Rational_Denominator_Schema,
    rational_normalizer: typeof normalize_rational = normalize_rational
): GraphQL_Composite_Instance {
    const rational = rational_normalizer(
        numerator,
        denominator
    )

    return {
        uid,
        schema_uid: rational_schema.uid!,
        data_type: 'Composite',
        objects: [
            {
                element_relationship_uid: 'numerator',
                instance: create_number_instance(
                    `${uid}.numerator`,
                    rational.numerator,
                    numerator_schema
                )
            },
            {
                element_relationship_uid: 'denominator',
                instance: create_number_instance(
                    `${uid}.denominator`,
                    rational.denominator,
                    denominator_schema
                )
            }
        ]
    }
}


export function schematician_to_math_protocol(
    instance: GraphQL_Instance,
    rational_schema: Schema<'Composite'> = Rational_Schema,
    rational_normalizer: typeof normalize_rational = normalize_rational
): Math_Protocol_Node {

    /*
     * Number
     */
    if (
        instance.data_type ===
        'Number'
    ) {

        if (
            typeof instance.value !==
            'number'
        ) {
            throw new Error(
                `Number instance ${instance.uid} has no numeric value.`
            )
        }


        return {
            type:
                'Number',

            value:
                instance.value
        }
    }


    /*
     * Variable
     */
    if (
        is_variable_instance(
            instance
        )
    ) {

        return {
            type:
                'Symbol',

            uid:
                instance.uid,

            name:
                get_variable_name(
                    instance
                )
        }
    }


    if (
        instance.data_type === 'Composite' &&
        instance.schema_uid === rational_schema.uid
    ) {
        const numerator = get_composite_child(
            instance,
            'numerator'
        )
        const denominator = get_composite_child(
            instance,
            'denominator'
        )

        if (
            !numerator || numerator.data_type !== 'Number' ||
            typeof numerator.value !== 'number' ||
            !denominator || denominator.data_type !== 'Number' ||
            typeof denominator.value !== 'number'
        ) {
            throw new Error(
                `Rational ${instance.uid} has invalid components.`
            )
        }

        return {
            type: 'Rational',
            ...rational_normalizer(
                numerator.value,
                denominator.value
            )
        }
    }

    /*
     * Equation
     */
    if (
        instance.data_type ===
        'Composite' &&

        instance.schema_uid ===
        Equation_Schema.uid
    ) {

        const left =
            get_composite_child(
                instance,
                'left'
            )


        const right =
            get_composite_child(
                instance,
                'right'
            )


        if (
            !left ||
            !right
        ) {
            throw new Error(
                `Equation ${instance.uid} is missing a side.`
            )
        }


        return {
            type:
                'Equation',

            left:
                schematician_to_math_protocol(
                    left,
                    rational_schema,
                    rational_normalizer
                ),

            right:
                schematician_to_math_protocol(
                    right,
                    rational_schema,
                    rational_normalizer
                )
        }
    }


    /*
     * Operation Application
     */
    if (
        instance.data_type ===
        'Composite' &&

        instance.schema_uid ===
        Operation_Application_Schema.uid
    ) {

        const operation_uid =
            get_operation_uid(
                instance
            )


        if (
            operation_uid === null
        ) {
            throw new Error(
                `Operation application ${instance.uid} has no operation UID.`
            )
        }


        const values =
            get_operation_application_values(
                instance
            )


        return {
            type:
                'Operation',

            operation:
                map_operation_uid_to_protocol(
                    operation_uid
                ),

            arguments:
                values.map(
                    value =>
                        schematician_to_math_protocol(
                            value,
                            rational_schema,
                            rational_normalizer
                        )
                )
        }
    }


    throw new Error(
        `Unsupported Schematician math instance: ` +
        `${instance.schema_uid} (${instance.data_type})`
    )
}

export function create_equation_instance(
    uid: string,
    equation_schema = Equation_Schema,
    left:
        GraphQL_Instance,

    right:
        GraphQL_Instance
): GraphQL_Composite_Instance {

    return {
        uid,

        schema_uid:
            equation_schema.uid!,

        data_type:
            'Composite',

        objects: [
            {
                element_relationship_uid:
                    'left',

                instance:
                    left
            },

            {
                element_relationship_uid:
                    'right',

                instance:
                    right
            }
        ]
    }
}
export function math_protocol_to_schematician(
    node: Math_Protocol_Node,
    variable_registry: Map<string, GraphQL_Composite_Instance>,
    uid_prefix: string,
    rational_schema: Schema<'Composite'> = Rational_Schema,
    numerator_schema: Schema<'Number'> = Rational_Numerator_Schema,
    denominator_schema: Schema<'Number'> = Rational_Denominator_Schema,
    rational_normalizer: typeof normalize_rational = normalize_rational
): GraphQL_Instance {

    switch (
    node.type
    ) {

        case 'Number':

            return create_number_instance(
                `${uid_prefix}.number`,
                node.value
            )


        case 'Rational':

            return create_rational_instance(
                `${uid_prefix}.rational`,
                node.numerator,
                node.denominator,
                rational_schema,
                numerator_schema,
                denominator_schema,
                rational_normalizer
            )


        case 'Symbol': {

            const existing =
                variable_registry.get(
                    node.uid
                )


            if (
                existing
            ) {
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
                uid_prefix,
                rational_schema,
                numerator_schema,
                denominator_schema,
                rational_normalizer
            )


        case 'Equation':

            return create_equation_instance(
                `${uid_prefix}.equation`,
                Equation_Schema,
                math_protocol_to_schematician(
                    node.left,
                    variable_registry,
                    `${uid_prefix}.left`,
                    rational_schema,
                    numerator_schema,
                    denominator_schema,
                    rational_normalizer
                ),

                math_protocol_to_schematician(
                    node.right,
                    variable_registry,
                    `${uid_prefix}.right`,
                    rational_schema,
                    numerator_schema,
                    denominator_schema,
                    rational_normalizer
                )
            )


        default:

            return assert_never(
                node
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

export function protocol_operation_to_schematician(
    node: Math_Operation_Node,
    variables: Map<string, GraphQL_Composite_Instance>,
    uid: string,
    rational_schema: Schema<'Composite'> = Rational_Schema,
    numerator_schema: Schema<'Number'> = Rational_Numerator_Schema,
    denominator_schema: Schema<'Number'> = Rational_Denominator_Schema,
    rational_normalizer: typeof normalize_rational = normalize_rational
): GraphQL_Composite_Instance {

    const args =
        node.arguments.map(
            (argument, index) =>
                math_protocol_to_schematician(
                    argument,
                    variables,
                    `${uid}.argument.${index}`,
                    rational_schema,
                    numerator_schema,
                    denominator_schema,
                    rational_normalizer
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


        case 'Subtract': {

            const [
                left,
                right
            ] =
                require_binary_arguments(
                    'Subtract',
                    args
                )

            return create_binary_operation_application(
                `${uid}.subtraction`,

                Subtraction_Operation,

                'minuend',
                left,

                'subtrahend',
                right
            )
        }


        case 'Power': {

            const [
                base,
                exponent
            ] =
                require_binary_arguments(
                    'Power',
                    args
                )

            return create_binary_operation_application(
                `${uid}.power`,

                Power_Operation,

                'base',
                base,

                'exponent',
                exponent
            )
        }


        case 'Divide': {

            const [
                dividend,
                divisor
            ] =
                require_binary_arguments(
                    'Divide',
                    args
                )

            return create_binary_operation_application(
                `${uid}.division`,

                Division_Operation,

                'dividend',
                dividend,

                'divisor',
                divisor
            )
        }
    }


    return assert_never(
        node.operation
    )
}
function assert_never(
    value: never
): never {

    throw new Error(
        `Unhandled value: ${String(value)}`
    )
}
function require_binary_arguments(
    operation: string,
    args: GraphQL_Instance[]
): [
        GraphQL_Instance,
        GraphQL_Instance
    ] {

    if (
        args.length !== 2
    ) {
        throw new Error(
            `${operation} requires exactly 2 arguments. ` +
            `Received ${args.length}.`
        )
    }

    return [
        args[0]!,
        args[1]!
    ]
}

export function create_binary_operation_application(
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

