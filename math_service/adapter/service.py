from sympy import (
    Symbol,
    Add,
    Mul,
    Pow,
    factor
)


def protocol_to_sympy(node):

    kind = node["type"]

    if kind == "Number":
        return node["value"]

    if kind == "Symbol":
        return Symbol(
            node["name"]
        )

    if kind == "Operation":

        args = [
            protocol_to_sympy(arg)
            for arg in node["arguments"]
        ]

        operation = node["operation"]

        if operation == "Add":
            return Add(*args)

        if operation == "Multiply":
            return Mul(*args)

        if operation == "Subtract":
            return args[0] - args[1]

        if operation == "Divide":
            return args[0] / args[1]

        if operation == "Power":
            return Pow(
                args[0],
                args[1]
            )


