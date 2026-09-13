import re

_CAMEL_RE = re.compile(r'(?<!^)(?=[A-Z])')


def to_camel(key):
    if not isinstance(key, str) or '_' not in key:
        return key
    head, *tail = key.split('_')
    return head + ''.join(part.title() for part in tail)


def to_snake(key):
    if not isinstance(key, str) or key.islower() or '_' in key:
        return key
    return _CAMEL_RE.sub('_', key).lower()


def camelize(data):
    if isinstance(data, dict):
        return {to_camel(k): camelize(v) for k, v in data.items()}
    if isinstance(data, list):
        return [camelize(item) for item in data]
    return data


def snakeize(data):
    if isinstance(data, dict):
        return {to_snake(k): snakeize(v) for k, v in data.items()}
    if isinstance(data, list):
        return [snakeize(item) for item in data]
    return data
