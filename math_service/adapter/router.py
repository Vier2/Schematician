from fastapi import APIRouter
from fastapi import (
    FastAPI,
    HTTPException,
)

from .models import (
    MathRequest,
    MathFactorResponse,
    MathIsolateResponse,
    MathResponse
)

from ..factor.service import (
    factor_expression,
)
from ..isolate.service import isolate_variable


math_router = APIRouter(prefix='/math')

@math_router.post('', response_model= MathResponse)
async def math(
    request: MathRequest,
) ->  MathResponse:

    match request.objective:

        case "Factor":
            return factor_expression(
                request
            )

        case "Isolate":
            return isolate_variable(
                request)