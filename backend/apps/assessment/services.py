from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from apps.assessment.models import AssessmentResult, AssessmentRule
from apps.event.models import Event
from apps.ranger.models import Patrol, Ranger
from apps.training.models import Course, StudyRecord


def current_period():
    now = timezone.localtime()
    return now.year, now.month


def get_active_rule():
    return AssessmentRule.objects.newest_first().first()


@transaction.atomic
def save_rule(**payload):
    rule = AssessmentRule.objects.newest_first().first()
    if rule:
        for key, value in payload.items():
            setattr(rule, key, value)
        rule.save()
        return rule
    return AssessmentRule.objects.create(**payload)


def _patrol_distance(ranger_id, year, month):
    return (
        Patrol.objects.for_ranger(ranger_id)
        .filter(start_time__year=year, start_time__month=month)
        .aggregate(total=Sum('distance'))['total']
        or 0
    )


def _closed_event_count(ranger_id, year, month):
    return (
        Event.objects.for_ranger(ranger_id)
        .closed()
        .filter(created_at__year=year, created_at__month=month)
        .count()
    )


def _study_score(ranger_id, study_weight):
    published = Course.objects.published().count()
    if not published:
        return 0
    finished = StudyRecord.objects.by_ranger(ranger_id).finished().count()
    return round(min(finished / published, 1) * study_weight, 2)


@transaction.atomic
def recompute_assessments(year, month):
    rule = get_active_rule()
    patrol_weight = rule.patrol_weight if rule else 40
    event_weight = rule.event_weight if rule else 30
    study_weight = rule.study_weight if rule else 30
    patrol_target = (rule.patrol_target if rule and rule.patrol_target else 100) or 100
    event_target = max(rule.checkin_target if rule and rule.checkin_target else 3, 1)

    rangers = list(Ranger.objects.active())
    scores = {}
    for ranger in rangers:
        distance = _patrol_distance(ranger.id, year, month)
        patrol_score = round(min(distance / patrol_target, 1) * patrol_weight, 2)
        closed_events = _closed_event_count(ranger.id, year, month)
        event_score = round(min(closed_events / event_target, 1) * event_weight, 2)
        study_score = _study_score(ranger.id, study_weight)
        scores[ranger.id] = {
            'ranger': ranger,
            'patrol_score': patrol_score,
            'event_score': event_score,
            'study_score': study_score,
            'total_score': round(patrol_score + event_score + study_score, 2),
        }

    by_town = {}
    for item in scores.values():
        by_town.setdefault(item['ranger'].town_id, []).append(item)
    for items in by_town.values():
        items.sort(key=lambda x: x['total_score'], reverse=True)
        for index, item in enumerate(items, start=1):
            item['rank_in_town'] = index

    computed = 0
    for item in scores.values():
        ranger = item['ranger']
        AssessmentResult.objects.update_or_create(
            ranger=ranger,
            year=year,
            month=month,
            defaults={
                'ranger_name': ranger.name,
                'town_id': ranger.town_id,
                'patrol_score': item['patrol_score'],
                'event_score': item['event_score'],
                'study_score': item['study_score'],
                'total_score': item['total_score'],
                'rank_in_town': item['rank_in_town'],
            },
        )
        computed += 1
    return computed
