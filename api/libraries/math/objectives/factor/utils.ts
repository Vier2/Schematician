import type { 
    Factor_Objective,
Factor_Result } from "./types.js"
import type { Symbolic_Math_Engine } from "./types.js"
import { clone_instance } from "../subsitition/utils.js"

export async function factor(
    objective:
        Factor_Objective,

    engine:
        Symbolic_Math_Engine

): Promise<Factor_Result> {

    const result =
        await engine.factor(
            objective.inputs.target,

            {
                domain:
                    objective.inputs.domain!
            }
        )


    return {

        objective_type:
            'Factor',

        output: {
            result
        },

        trace: {

            engine:
                engine.uid,

            operation:
                'Factor',

            input:
                clone_instance(
                    objective.inputs.target
                ),

            output:
                clone_instance(
                    result
                ),

            domain:
                objective.inputs.domain!
        }
    }
}