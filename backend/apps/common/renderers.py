from rest_framework.renderers import JSONRenderer

from apps.common.casing import camelize


class CamelCaseJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        return super().render(camelize(data), accepted_media_type, renderer_context)
