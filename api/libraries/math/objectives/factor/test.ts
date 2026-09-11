import { 
    create_variable_instance,
    create_number_instance,
    create_binary_operation_application
} from "../../adapter/utils.js"

import type { 
    GraphQL_Composite_Instance,
    GraphQL_Instance
 } from "@schematician/shared"
import type { Factor_Options } from "./types.js"
import { create_addition,
    create_multiplication
 } from "../expand/utils.js"
import { Power_Operation } from "../../schema.js"
import type { Factor_Objective } from "./types.js"
import { factor } from "./utils.js"
import { print_objective_result } from "../../formatter/utils.js"
import type { Symbolic_Math_Engine } from "./types.js"
import { collect_variables, call_sympy } from "../../adapter/class.js"
import { schematician_to_math_protocol, math_protocol_to_schematician } from "../../adapter/utils.js"
import { Equation_Schema } from "../../object.js"
const X =
    create_variable_instance(
        'math.instance.variable.x',
        'x'
    )

const Two =
    create_number_instance(
        'math.instance.number.2',
        2
    )

const Three =
    create_number_instance(
        'math.instance.number.3',
        3
    )

const Five =
    create_number_instance(
        'math.instance.number.5',
        5
    )

const Six =
    create_number_instance(
        'math.instance.number.6',
        6
    )


const X_Squared =
    create_binary_operation_application(
        'factor.test.x_squared',

        Power_Operation,

        'base',
        X,

        'exponent',
        Two
    )


const Five_X =
    create_multiplication(
        'factor.test.five_x',

        [
            Five,
            X
        ]
    )


const Polynomial =
    create_addition(
        'factor.test.polynomial',

        [
            X_Squared,
            Five_X,
            Six
        ]
    )


const Factor_Test:
    Factor_Objective = {

    type:
        'Factor',

    inputs: {

        target:
            Polynomial,

        domain:
            'Rational'
    }
}
export const SymPy_Engine:
    Symbolic_Math_Engine = {

    uid:
        'sympy',


    async factor(
        expression:
            GraphQL_Instance,

        options:
            Factor_Options
    ): Promise<GraphQL_Instance> {

        const variable_registry =
            collect_variables(
                expression
            )


        const protocol_expression =
            schematician_to_math_protocol(
                expression
            )


        const response =
            await call_sympy({
                objective:
                    'Factor',

                expression:
                    protocol_expression,

                options}, '')


        if (
            response.objective !==
            'Factor'
        ) {
            throw new Error(
                `Expected Factor response, received ${response.objective}.`
            )
        }


        return math_protocol_to_schematician(
            response.expression,           
             variable_registry,
            'sympy.factor.result'
        )
    },

    async isolate(
        equation,
        target
    ) {

        const variables =
            collect_variables(
                equation
            )


        variables.set(
            target.uid,
            target
        )


        const equation_protocol =
            schematician_to_math_protocol(
                equation
            )


        const target_protocol =
            schematician_to_math_protocol(
                target
            )


        if (
            equation_protocol.type !==
            'Equation'
        ) {
            throw new Error(
                'Expected Equation protocol node.'
            )
        }


        if (
            target_protocol.type !==
            'Symbol'
        ) {
            throw new Error(
                'Isolation target must be a Symbol.'
            )
        }


        const response =
            await call_sympy({
                objective:
                    'Isolate',

                equation:
                    equation_protocol,

                target:
                    target_protocol
            }, 'http://localhost:8000/math')


        if (
            response.objective !==
            'Isolate'
        ) {
            throw new Error(
                'Unexpected math service response.'
            )
        }


        return math_protocol_to_schematician(
            response.equation,
            variables,
            'sympy.isolate.result'
        ) as GraphQL_Composite_Instance
    }
}

const result =
    await factor(
        Factor_Test,
        SymPy_Engine
    )





print_objective_result(
    result
)