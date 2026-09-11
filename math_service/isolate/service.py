import sympy as sp

from ..adapter.models import (
    MathIsolateRequest,
    MathIsolateResponse,
    MathEquationNode,
)
from ..adapter.protocol import (
    SymbolContext, 
    protocol_to_sympy,
    sympy_to_protocol,
    MathNode

)

def isolate_variable(
    request: MathIsolateRequest,
) -> MathIsolateResponse:

    context = SymbolContext()


    left = protocol_to_sympy(
        request.equation.left,
        context,
    )


    right = protocol_to_sympy(
        request.equation.right,
        context,
    )


    target_node = MathNode(
        request.target
    )


    target = protocol_to_sympy(
        target_node,
        context,
    )


    solutions = sp.solve(
        sp.Eq(
            left,
            right,
        ),
        target,
    )


    if len(solutions) == 0:
        raise ValueError(
            "No solution was found for the target variable."
        )


    if len(solutions) > 1:
        raise ValueError(
            "Isolation produced multiple solutions. "
            "Use the Solve objective for multi-solution equations."
        )


    isolated_value = (
        solutions[0]
    )


    return MathIsolateResponse(
        objective="Isolate",

        equation=MathEquationNode(
            type="Equation",

            left=request.target,

            right=sympy_to_protocol(
                isolated_value,
                context,
            ).root,
        ),
    )