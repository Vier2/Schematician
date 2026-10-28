import type { Construct_Objective } from "./types.js"

export async function Construct(
    objective: Construct_Objective
): Promise<never> {
    void objective
    throw new Error('Construct is not implemented.')
}