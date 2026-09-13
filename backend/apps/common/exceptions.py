from rest_framework.views import exception_handler

from apps.common.constants import ErrorCode


def _first_error(detail):
    if isinstance(detail, list) and detail:
        return _first_error(detail[0])
    if isinstance(detail, dict) and detail:
        return _first_error(next(iter(detail.values())))
    return str(detail)


def envelope_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    detail = response.data
    status = response.status_code
    code_map = {
        400: ErrorCode.INVALID_PARAM,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        429: ErrorCode.RATE_LIMITED,
    }
    response.data = {
        'code': code_map.get(status, ErrorCode.SERVER_ERROR),
        'message': _first_error(detail),
        'errors': detail if isinstance(detail, dict) else None,
    }
    return response
