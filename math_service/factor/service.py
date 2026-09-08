import sympy as sp

from ..adapter.models import (
    MathFactorRequest,
    MathFactorResponse,
)

from ..adapter.protocol import (
    SymbolContext,
    protocol_to_sympy,
    sympy_to_protocol,
)


def factor_expression(
    request: MathFactorRequest,
) -> MathFactorResponse:

    context = SymbolContext()


    expression = protocol_to_sympy(
        request.expression,
        context,
    )


    domain = (
        request.options.domain
        if request.options is not None
        else None
    )


    if domain not in (
        None,
        "Rational",
    ):
        raise ValueError(
            f"Factor domain {domain!r} "
            "is not implemented yet."
        )


    result = sp.factor(
        expression
    )


    protocol_result = sympy_to_protocol(
            result,
            context,
        )


    return MathFactorResponse(
        objective="Factor",
        expression=protocol_result,
    )