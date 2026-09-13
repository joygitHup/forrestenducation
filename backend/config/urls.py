from django.urls import include, path

urlpatterns = [
    path('api/v1/', include('apps.common.urls')),
    path('api/', include('apps.common.urls')),
]
