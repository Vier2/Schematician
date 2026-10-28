import type { Differentiate_Objective } from "./types.js"

export function differentiate(
    objective: Differentiate_Objective
): never {
    void objective
    throw new Error('Differentiation is not implemented.')
}