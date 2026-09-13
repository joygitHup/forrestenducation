from rest_framework.response import Response

from apps.common.constants import ErrorCode


def ok(data=None, status=200, extra=None):
    payload = {'code': ErrorCode.OK, 'message': 'ok', 'data': data}
    if extra:
        payload.update(extra)
    return Response(payload, status=status)


def fail(message, status=400, code=None, errors=None):
    payload = {
        'code': code or (ErrorCode.UNAUTHORIZED if status == 401 else ErrorCode.NOT_FOUND if status == 404 else ErrorCode.INVALID_PARAM),
        'message': message,
    }
    if errors:
        payload['errors'] = errors
    return Response(payload, status=status)
