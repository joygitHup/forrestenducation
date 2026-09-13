from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import AdminUserViewSet, AuthViewSet
from apps.assessment.views import AssessmentRuleViewSet, AssessmentViewSet
from apps.event.views import EventViewSet, WarningViewSet
from apps.integration.views import DashboardViewSet, ExternalSystemViewSet, HealthViewSet
from apps.org.views import OrgViewSet
from apps.ranger.views import AreaViewSet, RangerViewSet
from apps.training.views import CourseViewSet, StudyViewSet

router = DefaultRouter()
router.register('ranger', RangerViewSet, basename='ranger')
router.register('area', AreaViewSet, basename='area')
router.register('event', EventViewSet, basename='event')
router.register('course', CourseViewSet, basename='course')
router.register('study', StudyViewSet, basename='study')
router.register('assessment', AssessmentViewSet, basename='assessment')
router.register('org', OrgViewSet, basename='org')
router.register('dashboard', DashboardViewSet, basename='dashboard')
router.register('users', AdminUserViewSet, basename='users')
router.register('auth', AuthViewSet, basename='auth')
router.register('health', HealthViewSet, basename='health')

urlpatterns = [
    path('assessment/rules/', AssessmentRuleViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('warning/', WarningViewSet.as_view({'get': 'list', 'put': 'set_status'})),
    path('external/systems/', ExternalSystemViewSet.as_view({'get': 'list', 'put': 'update'})),
    path('external/integrate/', ExternalSystemViewSet.as_view({'post': 'integrate'})),
    path('', include(router.urls)),
]
