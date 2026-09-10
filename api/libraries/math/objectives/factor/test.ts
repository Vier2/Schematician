import { 
    create_variable_instance,
    create_number_instance,
    create_binary_operation_application
} from "../../adapter/utils.js"

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
import type { Math_Request } from "./types.js"
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
        expression,
        options
    ) {

        const variable_registry =
            collect_variables(
                expression
            )


        const protocol_expression =
            schematician_to_math_protocol(
                expression
            )



        const request: Math_Request = {
            objective:
                'Factor',

            expression:
                protocol_expression
        }

        if (options !== undefined) {
            request.options = options
        }
        const response =
            await call_sympy(
                request
                , 'http://localhost:8000/math')


        return math_protocol_to_schematician(
            response.expression,

            variable_registry,

            'sympy.factor.result'
        )
    }
}

const result =
    await factor(
        Factor_Test,
        SymPy_Engine
    )


console.log(
    JSON.stringify(
        result.output
        null,
        2
    )
)


print_objective_result(
    result
)