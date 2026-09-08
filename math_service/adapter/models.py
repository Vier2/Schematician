from pydantic import BaseModel, Field, RootModel
from __future__ import annotations

from typing import Annotated, Literal




class Math_Input(BaseModel):
    operation: str


class Math_Output(BaseModel):
    operation: str




MathProtocolOperation = Literal[
    "Add",
    "Subtract",
    "Multiply",
    "Divide",
    "Power",
]

MathDomain = Literal[
    "Rational",
    "Real",
    "Complex",
]


class MathNumberNode(BaseModel):
    type: Literal["Number"]
    value: int | float


class MathRationalNode(BaseModel):
    type: Literal["Rational"]

    numerator: int
    denominator: int


class MathSymbolNode(BaseModel):
    type: Literal["Symbol"]

    uid: str
    name: str


class MathOperationNode(BaseModel):
    type: Literal["Operation"]

    operation: MathProtocolOperation

    arguments: list[MathNode]


class MathNode(
    RootModel[
        Annotated[
            MathNumberNode
            | MathRationalNode
            | MathSymbolNode
            | MathOperationNode,
            Field(discriminator="type"),
        ]
    ]
):
    pass


class FactorOptions(BaseModel):
    domain: MathDomain | None = None


class MathFactorRequest(BaseModel):
    objective:Literal["Factor"]

    expression:MathNode

    options:FactorOptions | None = None


class MathFactorResponse(BaseModel):
    objective: Literal["Factor"]

    expression: MathNode


# Resolve recursive model references.
MathOperationNode.model_rebuild()
MathNode.model_rebuild()