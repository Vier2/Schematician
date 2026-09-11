from __future__ import annotations
from pydantic import BaseModel, Field, RootModel

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
class MathIsolateRequest(BaseModel):
    objective: Literal["Isolate"]

    equation: MathEquationNode

    target: MathSymbolNode

class MathIsolateResponse(BaseModel):
    objective: Literal["Isolate"]

    equation: MathEquationNode

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

class MathEquationNode(BaseModel):
    type: Literal["Equation"]

    left:MathNode

    right:MathNode
    
class MathNode(
    RootModel[
        Annotated[
            MathNumberNode
            | MathRationalNode
            | MathSymbolNode
            | MathEquationNode
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

MathRequest = Annotated[
    MathFactorRequest
    | MathIsolateRequest,
    Field(
        discriminator="objective"
    ),
]
MathResponse = Annotated[
    MathFactorResponse
    | MathIsolateResponse,

    Field(
        discriminator="objective"
    ),
]

# Resolve recursive model references.
MathOperationNode.model_rebuild()
MathNode.model_rebuild()