from rest_framework.pagination import PageNumberPagination

from apps.common.response import ok


class StandardPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'pageSize'
    page_size = 20
    max_page_size = 500

    def get_page_size(self, request):
        # 兼容前端当前使用的 size
        if 'size' in request.query_params and 'pageSize' not in request.query_params:
            mutable = request.query_params.copy()
            mutable['pageSize'] = mutable.get('size')
            request._request.GET = mutable
        return super().get_page_size(request)

    def get_paginated_response(self, data):
        page_size = self.get_page_size(self.request)
        return ok(
            {
                'list': data,
                'total': self.page.paginator.count,
                'page': self.page.number,
                'pageSize': page_size,
                'size': page_size,
            }
        )
