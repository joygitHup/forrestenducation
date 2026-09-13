from rest_framework.parsers import JSONParser

from apps.common.casing import snakeize


class CamelCaseJSONParser(JSONParser):
    def parse(self, stream, media_type=None, parser_context=None):
        return snakeize(super().parse(stream, media_type, parser_context))
