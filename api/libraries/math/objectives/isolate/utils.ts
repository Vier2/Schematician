import type  { Isolate_Objective, Isolate_Result } from "./types.js"
import type { Symbolic_Math_Engine } from "../factor/types.js"

import { clone_instance } from "../subsitition/utils.js"
import type {
     GraphQL_Composite_Instance
     } from "@schematician/shared"
    
export async function isolate(
    objective:
        Isolate_Objective,

    engine:
        Symbolic_Math_Engine
): Promise<Isolate_Result> {

    const result =
        await engine.isolate(
            objective.inputs.equation,
            objective.inputs.target
        )


    return {
        objective_type:
            'Isolate',

        output: {
            result
        },

        trace: {
            engine:
                engine.uid,

            operation:
                'Isolate',

            input:
                clone_instance(
                    objective.inputs.equation
                ) as GraphQL_Composite_Instance,

            target:
                clone_instance(
                    objective.inputs.target
                ) as GraphQL_Composite_Instance,

            output:
                clone_instance(
                    result
                ) as GraphQL_Composite_Instance
        }
    }
}