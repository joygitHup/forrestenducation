def qp(request, *names, default=None):
    """Read the first non-empty query param among camelCase/snake_case aliases."""
    params = request.query_params
    for name in names:
        if name in params and params.get(name) not in (None, ''):
            return params.get(name)
    return default


def qp_int(request, *names, default=None):
    raw = qp(request, *names, default=None)
    if raw in (None, ''):
        return default
    try:
        return int(raw)
    except (TypeError, ValueError):
        return default
