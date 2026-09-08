## Pipeline

Factor_Objective
        │
        ▼
GraphQL_Instance
x² + 5x + 6
        │
        ▼
schematician_to_math_protocol()
        │
        ▼
Math_Factor_Request
        │
        ▼ HTTP
FastAPI /math
        │
        ▼
Pydantic MathFactorRequest
        │
        ▼
protocol_to_sympy()
        │
        ▼
SymPy expression
        │
        ▼
sympy.factor()
        │
        ▼
(x + 2)(x + 3)
        │
        ▼
sympy_to_protocol()
        │
        ▼
MathFactorResponse
        │
        ▼ HTTP
call_sympy()
        │
        ▼
Math_Protocol_Node
        │
        ▼
math_protocol_to_schematician()
        │
        ▼
GraphQL_Instance
        │
        ▼
Factor_Result