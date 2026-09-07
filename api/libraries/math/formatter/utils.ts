import type
{ Objective_Result,
    Objective_type,
    GraphQL_Instance,
    Substitution_Trace_Step,
    Runtime_Values,
    Operation_Trace,
    Computation_Trace,
    Runtime_Value,
    GraphQL_Composite_Instance,

 } from "@schematician/shared"


function format_instance(
    instance: GraphQL_Instance
): string {

    switch (instance.data_type) {

        case 'String':
            return `"${instance.value}"`

        case 'Number':
        case 'Boolean':
            return String(instance.value)

        case 'Array':
            return `[${instance.items
                .map(format_instance)
                .join(', ')
                }]`

        case 'Composite':
            return `{${instance.uid}}`
    }
}
export const Objective_Trace_Formatters = {
    Evaluate:
        format_computation_trace,

    Substitute:
        format_substitution_trace

    // Solve:
    //     format_solve_trace,

    // Factor:
    //     format_transformation_trace,
}
export type Objective_Trace_Formatter<
    Trace
> = (
    trace: Trace
) => string[]

export function format_substitution_trace(
    trace: Substitution_Trace_Step[]
): string[] {

    const lines: string[] = []

    lines.push('├── Substitutions')

    trace.forEach(
        (step, index) => {

            const is_last =
                index ===
                trace.length - 1

            const connector =
                is_last
                    ? '└──'
                    : '├──'

            const original =
                format_instance(
                    step.original
                )

            const replacement =
                format_instance(
                    step.replacement
                )

            lines.push(
                `│   ${connector} ${step.variable_uid
                }: ${original
                } → ${replacement
                }`
            )

            if (
                step.path.length > 0
            ) {

                lines.push(
                    `│       path: ${step.path.join(' → ')
                    }`
                )
            }
        }
    )

    return lines
}
export function format_objective_output(
    output: unknown
): string[] {

    if (
        is_graphql_instance(output)
    ) {

        return [
            format_instance(output)
        ]
    }

    if (Array.isArray(output)) {

        return output.flatMap(
            (item, index) => {

                const formatted =
                    format_objective_output(
                        item
                    )

                return formatted.map(
                    line =>
                        `[${index}] ${line}`
                )
            }
        )
    }

    if (
        typeof output === 'object' &&
        output !== null
    ) {

        const lines: string[] = []

        for (
            const [key, value]
            of Object.entries(output)
        ) {

            if (
                is_graphql_instance(value)
            ) {

                lines.push(
                    `${key} = ${format_instance(value)
                    }`
                )

                continue
            }

            if (
                Array.isArray(value) &&
                value.every(
                    is_graphql_instance
                )
            ) {

                lines.push(
                    `${key} = [${value
                        .map(format_instance)
                        .join(', ')
                    }]`
                )

                continue
            }

            if (
                typeof value !== 'object' ||
                value === null
            ) {

                lines.push(
                    `${key} = ${String(value)}`
                )

                continue
            }

            lines.push(
                `${key}:`
            )

            lines.push(
                ...format_objective_output(
                    value
                ).map(
                    line =>
                        `    ${line}`
                )
            )
        }

        return lines
    }

    return [
        String(output)
    ]
}
export function is_graphql_instance(
    value: unknown
): value is GraphQL_Instance {

    if (
        typeof value !== 'object' ||
        value === null
    ) {
        return false
    }

    const candidate =
        value as Partial<
            GraphQL_Instance
        >

    return (
        typeof candidate.uid === 'string' &&
        (
            candidate.data_type === 'String' ||
            candidate.data_type === 'Number' ||
            candidate.data_type === 'Boolean' ||
            candidate.data_type === 'Composite' ||
            candidate.data_type === 'Array'
        )
    )
}
function format_runtime_value(
    value: Runtime_Value
): string {

    if (Array.isArray(value)) {
        return `[${value
            .map(format_instance)
            .join(', ')
            }]`
    }

    return format_instance(value)
}
 function format_values(
     values: Runtime_Values
 ): string {
 
     return Object.entries(values)
         .map(
             ([name, value]) =>
                 `${name} = ${format_runtime_value(value)}`
         )
         .join(', ')
 }

 function format_operation_trace(
     trace: Operation_Trace,
     prefix = '',
     is_last = true
 ): string[] {
 
     const connector =
         is_last
             ? '└── '
             : '├── '
 
     const child_prefix =
         prefix +
         (
             is_last
                 ? '    '
                 : '│   '
         )
 
     const lines: string[] = []
 
     lines.push(
         `${prefix}${connector}${trace.operation_name}`
     )
 
     lines.push(
         `${child_prefix}├─ Inputs:  ${format_values(trace.inputs)
         }`
     )
 
     lines.push(
         `${child_prefix}└─ Outputs: ${format_values(trace.outputs)
         }`
     )
 
 
     trace.children.forEach(
         (child, index) => {
 
             const child_is_last =
                 index ===
                 trace.children.length - 1
 
             lines.push(
                 ...format_operation_trace(
                     child,
                     child_prefix,
                     child_is_last
                 )
             )
         }
     )
 
     return lines
 }
 
 
//  export function print_execution_result(
//      result: {
//          outputs: Runtime_Values
//          trace: Operation_Trace
//      }
//  ): void {
 
//      const trace = result.trace
 
//      console.log('')
//      console.log(
//          `${trace.operation_name}`
//      )
 
//      console.log(
//          `├─ Inputs:  ${format_values(trace.inputs)
//          }`
//      )
 
//      console.log('│')
 
//      if (trace.children.length > 0) {
 
//          trace.children.forEach(
//              (child, index) => {
 
//                  const is_last =
//                      index ===
//                      trace.children.length - 1
 
//                  for (
//                      const line
//                      of format_operation_trace(
//                          child,
//                          '├─ ',
//                          is_last
//                      )
//                  ) {
//                      console.log(line)
//                  }
//              }
//          )
 
//          console.log('│')
//      }
 
//      console.log(
//          `└─ Result:  ${format_values(result.outputs)
//          }`
//      )
 
//      console.log('')
//  }
 
export function print_objective_result<
    T extends Objective_type,
    O,
    Trace
>(
    result: Objective_Result<
        T,
        O,
        Trace
    >
): void {

    console.log('')
    console.log(
        `Objective: ${result.objective_type}`
    )

    console.log('│')

    const trace_formatter =
        Objective_Trace_Formatters[result.objective_type as keyof typeof Objective_Trace_Formatters
        ] as
        | Objective_Trace_Formatter<Trace>
        | undefined

    if (trace_formatter) {

        const trace_lines =
            trace_formatter(
                result.trace
            )

        for (const line of trace_lines) {
            console.log(line)
        }

        console.log('│')
    }


    console.log('└── Output')

    for (
        const line
        of format_objective_output(
            result.output
        )
    ) {
        console.log(
            `    ${line}`
        )
    }

    console.log('')
}


export function format_computation_trace(
    trace: Computation_Trace
): string[] {

    const lines: string[] = []

    lines.push(
        `├── Computation: ${trace.computation_name}`
    )

    lines.push(
        `│   ├── Inputs: ${format_values(trace.inputs)}`
    )

    if (
        trace.operations.length > 0
    ) {

        lines.push('│   │')

        trace.operations.forEach(
            (operation, index) => {

                const is_last =
                    index ===
                    trace.operations.length - 1

                lines.push(
                    ...format_operation_trace(
                        operation,
                        '│   ',
                        is_last
                    )
                )
            }
        )
    }

    lines.push(
        `│   └── Outputs: ${format_values(trace.outputs)}`
    )

    return lines
}



