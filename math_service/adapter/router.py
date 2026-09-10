from fastapi import APIRouter
from .models import Math_Input, Math_Output
from fastapi import (
    FastAPI,
    HTTPException,
)

from .models import (
    MathFactorRequest,
    MathFactorResponse,
)

from ..factor.service import (
    factor_expression,
)



math_router = APIRouter(prefix='/math')

@math_router.post('', response_model=MathFactorResponse)
async def math(request: MathFactorRequest):
    try:
        return factor_expression(
            request
        )

    except (
        ValueError,
        TypeError,
    ) as error: raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error
    pass

    return Math_Output