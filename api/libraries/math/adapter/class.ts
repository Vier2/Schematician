import type { 
    Symbolic_Math_Engine,
    Factor_Options
 } from "../objectives/factor/types.js"
import type { 
    GraphQL_Instance,
    GraphQL_Composite_Instance

 } from "@schematician/shared"

 import type { Math_Request, Math_Response } from "../objectives/factor/types.js"
import { 
    schematician_to_math_protocol,
    math_protocol_to_schematician,
    
 } from "./utils.js"
import { Variable_Schema } from "../object.js"
export class SymPy_Adapter
    implements Symbolic_Math_Engine {

    uid =
        'engine.sympy'

    async factor(
        expression:
            GraphQL_Instance,

        options?:
            Factor_Options 

    ): Promise<GraphQL_Instance> {

        const protocol =
            schematician_to_math_protocol(
                expression
            )


        const request: Math_Request = {
            objective:
                'Factor',

            expression:
                protocol
        }

        if (options !== undefined) {
            request.options = options
        }

        const response =
            await call_sympy(
                request,
                'https://localhost:8000/math'
            )


        return math_protocol_to_schematician(
            response.expression,

            collect_variables(
                expression
            ),

            'sympy.factor.result'
        )
    }
}
export function collect_variables(
    target:
        GraphQL_Instance,
    variable_schema = Variable_Schema
): Map<
    string,
    GraphQL_Composite_Instance
> {

    const variables =
        new Map<
            string,
            GraphQL_Composite_Instance
        >()


    function visit(
        instance:
            GraphQL_Instance
    ): void {

        if (
            instance.data_type ===
            'Composite' &&

            instance.schema_uid ===
            variable_schema.uid
        ) {

            variables.set(
                instance.uid,
                instance
            )

            return
        }


        switch (instance.data_type) {

            case 'String':
            case 'Number':
            case 'Boolean':

                return


            case 'Array':

                for (
                    const item
                    of instance.items
                ) {
                    visit(item)
                }

                return


            case 'Composite':

                for (
                    const object
                    of instance.objects
                ) {
                    visit(
                        object.instance
                    )
                }

                return
        }
    }


    visit(target)

    return variables
}


export async function call_sympy(
    request: Math_Request,
    math_service_url: string
): Promise<Math_Response> {

    const response =
        await fetch(
            math_service_url,

            {
                method:
                    'POST',

                headers: {
                    'content-type':
                        'application/json'
                },

                body:
                    JSON.stringify(
                        request
                    )
            }
        )


    if (!response.ok) {

        const error =
            await response.text()

        throw new Error(
            `SymPy service failed ` +
            `(${response.status}): ${error}`
        )
    }


    return (
        await response.json()
    ) as Math_Response
}