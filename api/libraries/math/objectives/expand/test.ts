import { create_multiplication,
    create_addition,
    expand
 } from "./utils.js"

 import { print_objective_result } from "../../formatter/utils.js"
import type { Expand_Objective,
    Expansion_Trace_Step
 } from "./types.js"

import { X_Variable_Instance,
    Number_Two_Instance,
 } from "../subsitition/test.js"

 import { Number_Three_Instance } from "../../schema.js"
 const X_Plus_Two =
     create_addition(
         'expand.test.x_plus_2',
         [
             X_Variable_Instance,
             Number_Two_Instance
         ]
     )
const Three_Times_X_Plus_Two =
    create_multiplication(
        'expand.test.expression',
        [
            Number_Three_Instance,
            X_Plus_Two
        ]
    )
const Expand_Test_1:
    Expand_Objective = {

    type:
        'Expand',

    inputs: {
        target:
            Three_Times_X_Plus_Two
    }
}

const expand_result_1 =
    expand(
        Expand_Test_1
    )

// print_objective_result(
//     expand_result_1
// )

const X_Plus_Three =
    create_addition(
        'expand.test.x_plus_3',
        [
            X_Variable_Instance,
            Number_Three_Instance
        ]
    )

const Binomial_Product =
    create_multiplication(
        'expand.test.binomial_product',
        [
            X_Plus_Two,
            X_Plus_Three
        ]
    )
export function format_expansion_trace(
    trace: Expansion_Trace_Step[]
): string[] {

    const lines: string[] = []

    lines.push(
        '├── Expansions'
    )

    trace.forEach(
        (step, index) => {

            const is_last =
                index ===
                trace.length - 1

            lines.push(
                `│   ${is_last
                    ? '└──'
                    : '├──'
                } ${step.rule}`
            )

            if (
                step.path.length > 0
            ) {
                lines.push(
                    `│       path: ${step.path.join(
                        ' → '
                    )
                    }`
                )
            }
        }
    )

    return lines
}
const expand_result_2 =
    expand({
        type: 'Expand',

        inputs: {
            target:
                Binomial_Product
        }
    })
// console.log(`expand 1 ${(JSON.stringify(expand_result_1.output))}`)

// console.log(`expand 2 ${(JSON.stringify(expand_result_2.output))}`)