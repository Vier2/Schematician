from __future__ import annotations

from dataclasses import dataclass, field

import sympy as sp

from .models import (
    MathNode,
    MathNumberNode,
    MathOperationNode,
    MathRationalNode,
    MathSymbolNode,
)


@dataclass
class SymbolContext:
    """
    Maps Schematician variable UIDs
    to both SymPy symbols and their
    original protocol metadata.
    """

    symbols_by_uid: dict[str, sp.Symbol] = field(
            default_factory=dict
        )

    protocol_by_uid:dict[str, MathSymbolNode] = field(
            default_factory=dict
        )


def protocol_to_sympy(
    node: MathNode,
    context: SymbolContext,
) -> sp.Expr:

    value = node.root


    if isinstance(
        value,
        MathNumberNode,
    ):
        if isinstance(
            value.value,
            int,
        ):
            return sp.Integer(
                value.value
            )

        return sp.Float(
            value.value
        )


    if isinstance(
        value,
        MathRationalNode,
    ):
        if value.denominator == 0:
            raise ValueError(
                "Rational denominator cannot be zero."
            )

        return sp.Rational(
            value.numerator,
            value.denominator,
        )


    if isinstance(
        value,
        MathSymbolNode,
    ):

        existing = context.symbols_by_uid.get(
                value.uid
            )

        if existing is not None:
            return existing


        # Use the UID as SymPy's internal symbol
        # identity rather than the display name.
        symbol = sp.Symbol(
            value.uid
        )


        context.symbols_by_uid[
            value.uid
        ] = symbol

        context.protocol_by_uid[
            value.uid
        ] = value


        return symbol


    if isinstance(
        value,
        MathOperationNode,
    ):

        arguments = [
            protocol_to_sympy(
                argument,
                context,
            )
            for argument
            in value.arguments
        ]


        match value.operation:

            case "Add":
                return sp.Add(
                    *arguments
                )


            case "Multiply":
                return sp.Mul(
                    *arguments
                )


            case "Subtract":

                require_arity(
                    value.operation,
                    arguments,
                    2,
                )

                return (
                    arguments[0]
                    -
                    arguments[1]
                )


            case "Divide":

                require_arity(
                    value.operation,
                    arguments,
                    2,
                )

                return (
                    arguments[0]
                    /
                    arguments[1]
                )


            case "Power":

                require_arity(
                    value.operation,
                    arguments,
                    2,
                )

                return sp.Pow(
                    arguments[0],
                    arguments[1],
                )


    raise TypeError(
        f"Unsupported protocol node: {value!r}"
    )


def require_arity(
    operation: str,
    arguments: list[sp.Expr],
    expected: int,
) -> None:

    if len(arguments) != expected:
        raise ValueError(
            f"{operation} requires "
            f"{expected} arguments; "
            f"received {len(arguments)}."
        )
    
def sympy_to_protocol(
    expression: sp.Expr,
    context: SymbolContext,
) -> MathNode:

    if isinstance(
        expression,
        sp.Integer,
    ):
        return MathNode(
            MathNumberNode(
                type="Number",
                value=int(expression),
            )
        )


    if isinstance(
        expression,
        sp.Rational,
    ):
        return MathNode(
            MathRationalNode(
                type="Rational",
                numerator=int(
                    expression.p
                ),
                denominator=int(
                    expression.q
                ),
            )
        )


    if isinstance(
        expression,
        sp.Float,
    ):
        return MathNode(
            MathNumberNode(
                type="Number",
                value=float(
                    expression
                ),
            )
        )


    if isinstance(
        expression,
        sp.Symbol,
    ):

        uid = str(
            expression
        )

        original = context.protocol_by_uid.get(
                uid
            )

        if original is None:
            return MathNode(
                MathSymbolNode(
                    type="Symbol",
                    uid=uid,
                    name=uid,
                )
            )


        return MathNode(
            MathSymbolNode(
                type="Symbol",
                uid=original.uid,
                name=original.name,
            )
        )


    if isinstance(
        expression,
        sp.Add,
    ):
        return MathNode(
            MathOperationNode(
                type="Operation",

                operation="Add",

                arguments=[
                    sympy_to_protocol(
                        argument,
                        context,
                    )
                    for argument
                    in expression.args
                ],
            )
        )


    if isinstance(
        expression,
        sp.Mul,
    ):
        return MathNode(
            MathOperationNode(
                type="Operation",

                operation="Multiply",

                arguments=[
                    sympy_to_protocol(
                        argument,
                        context,
                    )
                    for argument
                    in expression.args
                ],
            )
        )


    if isinstance(
        expression,
        sp.Pow,
    ):
        return MathNode(
            MathOperationNode(
                type="Operation",

                operation="Power",

                arguments=[
                    sympy_to_protocol(
                        expression.base,
                        context,
                    ),

                    sympy_to_protocol(
                        expression.exp,
                        context,
                    ),
                ],
            )
        )


    raise TypeError(
        "Cannot convert SymPy expression "
        f"{type(expression).__name__}: "
        f"{expression}"
    )