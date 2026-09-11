import { 
    create_variable_instance,
    create_number_instance,
    create_equation_instance
 } from "../../adapter/utils.js"
import type { Isolate_Objective } from "./types.js"
import { Equation_Schema } from "../../object.js"
import { 
    create_addition, 
    create_multiplication } from "../expand/utils.js"

import { isolate } from "./utils.js"
import { SymPy_Engine } from "../factor/test.js"
import { print_objective_result } from "../../formatter/utils.js"

const X =
    create_variable_instance(
        'math.instance.variable.x',
        'x'
    )


const Two =
    create_number_instance(
        'math.number.2',
        2
    )


const Three =
    create_number_instance(
        'math.number.3',
        3
    )


const Eleven =
    create_number_instance(
        'math.number.11',
        11
    )


const Two_X =
    create_multiplication(
        'isolate.test.two_x',

        [
            Two,
            X
        ]
    )


const Left =
    create_addition(
        'isolate.test.left',

        [
            Two_X,
            Three
        ]
    )


const Equation =
    create_equation_instance(
        'isolate.test.equation',
        Equation_Schema,
        Left,
        Eleven
    )

const Isolate_Test:
    Isolate_Objective = {

    type:
        'Isolate',

    inputs: {

        equation:
            Equation,

        target:
            X
    }
}

const result =
    await isolate(
        Isolate_Test,
        SymPy_Engine
    )


print_objective_result(
    result
)