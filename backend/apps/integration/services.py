from django.db import transaction

from apps.integration.adapters import dispatch
from apps.integration.models import ExternalSystem


@transaction.atomic
def set_system_enabled(system, enabled):
    system.enabled = bool(enabled)
    system.save(update_fields=['enabled'])
    return system


def integrate(slug, action='push', payload=None):
    return dispatch(slug, action, payload or {})
