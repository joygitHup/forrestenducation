from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import AdminUser
from apps.assessment.models import AssessmentResult, AssessmentRule
from apps.event.models import Event, Warning
from apps.integration.models import ExternalSystem
from apps.org.models import OrgNode
from apps.ranger.models import Area, Patrol, Ranger
from apps.training.models import Course, StudyRecord


def days_ago(days):
    return timezone.now() - timedelta(days=days)


class Command(BaseCommand):
    help = '写入与前端演示一致的种子数据'

    def handle(self, *args, **options):
        if Ranger.objects.exists():
            self.stdout.write('已有数据，跳过种子写入')
            return
        self._orgs()
        self._areas()
        self._rangers()
        self._patrols()
        self._events()
        self._training()
        self._assessment()
        self._warnings()
        self._external()
        self._users()
        self._reset_sqlite_sequence()
        self.stdout.write(self.style.SUCCESS('演示数据写入完成'))

    def _reset_sqlite_sequence(self):
        from django.db import connection

        if connection.vendor != 'sqlite':
            return
        tables = [
            'org_node', 'area', 'ranger', 'patrol', 'event', 'warning',
            'course', 'study_record', 'assessment_rule', 'assessment_result',
            'external_system', 'admin_user',
        ]
        with connection.cursor() as cursor:
            for table in tables:
                cursor.execute('SELECT MAX(id) FROM %s' % table)
                max_id = cursor.fetchone()[0] or 0
                cursor.execute('DELETE FROM sqlite_sequence WHERE name=%s', [table])
                cursor.execute('INSERT INTO sqlite_sequence(name, seq) VALUES (%s, %s)', [table, max_id])

    def _orgs(self):
        rows = [
            (1, '巴州区', 0, 1),
            (2, '平昌县', 0, 1),
            (3, '通江县', 0, 1),
            (11, '化成镇', 1, 2),
            (12, '鼎山镇', 1, 2),
            (13, '光辉镇', 1, 2),
            (101, '化成村', 11, 3),
            (102, '白坪村', 11, 3),
            (103, '鼎山村', 12, 3),
        ]
        for pk, name, parent_id, level in rows:
            OrgNode.objects.create(id=pk, name=name, parent_id=parent_id, level=level)

    def _areas(self):
        Area.objects.create(
            id=1, name='化成镇东片区', town_id=11,
            boundary=[[106.7, 31.82], [106.75, 31.82], [106.75, 31.85], [106.7, 31.85]],
            area_size=12.5, key_points=[{'name': '东坪瞭望塔', 'lng': 106.72, 'lat': 31.835, 'radius': 200}],
            ranger_name='张山林',
        )
        Area.objects.create(
            id=2, name='白坪水源保护区', town_id=11,
            boundary=[[106.78, 31.78], [106.83, 31.78], [106.83, 31.82], [106.78, 31.82]],
            area_size=8.8,
            key_points=[
                {'name': '水库大坝', 'lng': 106.8, 'lat': 31.8, 'radius': 150},
                {'name': '南侧闸口', 'lng': 106.81, 'lat': 31.79, 'radius': 100},
            ],
            ranger_name='李树生',
        )
        Area.objects.create(
            id=3, name='鼎山防火核心区', town_id=12,
            boundary=[[106.62, 31.7], [106.68, 31.7], [106.68, 31.75], [106.62, 31.75]],
            area_size=9.2, key_points=[{'name': '鼎山制高点', 'lng': 106.65, 'lat': 31.725, 'radius': 180}],
            ranger_name='王护林',
        )
        Area.objects.create(
            id=4, name='光辉镇西南片区', town_id=13,
            boundary=[[106.88, 31.9], [106.93, 31.9], [106.93, 31.94], [106.88, 31.94]],
            area_size=15.1, key_points=[], ranger_name='陈松林',
        )

    def _rangers(self):
        rows = [
            dict(id=1, name='张山林', phone='13800000001', id_card='511902199001011234', town_id=11, village_id=101, area_id=1, status=1, hire_date=date(2023, 3, 1), online=True, month_distance=126.5, month_checkin_rate=92, score=88),
            dict(id=2, name='李树生', phone='13800000002', id_card='511902198802012345', town_id=11, village_id=102, area_id=2, status=1, hire_date=date(2022, 6, 15), online=True, month_distance=98.2, month_checkin_rate=85, score=79),
            dict(id=3, name='王护林', phone='13800000003', id_card='511902199203053456', town_id=12, village_id=103, area_id=3, status=1, hire_date=date(2024, 1, 10), online=False, month_distance=76.9, month_checkin_rate=78, score=72),
            dict(id=4, name='赵青山', phone='13800000004', town_id=12, status=1, hire_date=date(2021, 9, 20), online=True, month_distance=152.3, month_checkin_rate=96, score=92),
            dict(id=5, name='陈松林', phone='13800000005', town_id=13, status=1, hire_date=date(2023, 8, 1), online=False, month_distance=45.6, month_checkin_rate=60, score=55),
            dict(id=6, name='周树林', phone='13800000006', town_id=13, status=0, hire_date=date(2020, 5, 10), online=False, month_distance=0, month_checkin_rate=0, score=0),
            dict(id=7, name='吴火安', phone='13800000007', town_id=13, status=1, hire_date=date(2024, 5, 20), online=True, month_distance=88.4, month_checkin_rate=88, score=81),
            dict(id=8, name='郑水库', phone='13800000008', town_id=13, status=1, hire_date=date(2023, 11, 11), online=False, month_distance=67.8, month_checkin_rate=74, score=68),
        ]
        for row in rows:
            Ranger.objects.create(**row)

    def _patrols(self):
        rows = [
            dict(id=1, ranger_id=1, ranger_name='张山林', town_id=11, start_time=days_ago(0), duration=7200, distance=6.5, status=1, key_points_hit=[{'pointName': '东坪瞭望塔', 'time': timezone.now().isoformat()}]),
            dict(id=2, ranger_id=2, ranger_name='李树生', town_id=11, start_time=days_ago(0), duration=5400, distance=4.8, status=1),
            dict(id=3, ranger_id=4, ranger_name='赵青山', town_id=12, start_time=days_ago(0), duration=8100, distance=7.9, status=1),
            dict(id=4, ranger_id=1, ranger_name='张山林', town_id=11, start_time=days_ago(1), duration=6600, distance=6.0, status=1),
            dict(id=5, ranger_id=3, ranger_name='王护林', town_id=12, start_time=days_ago(1), duration=4800, distance=3.2, status=2),
            dict(id=6, ranger_id=7, ranger_name='吴火安', town_id=13, start_time=days_ago(2), duration=8000, distance=8.1, status=1),
            dict(id=7, ranger_id=4, ranger_name='赵青山', town_id=12, start_time=days_ago(3), duration=9000, distance=9.0, status=1),
            dict(id=8, ranger_id=1, ranger_name='张山林', town_id=11, start_time=days_ago(4), duration=7200, distance=6.9, status=1),
            dict(id=9, ranger_id=2, ranger_name='李树生', town_id=11, start_time=days_ago(5), duration=6000, distance=5.5, status=1),
            dict(id=10, ranger_id=7, ranger_name='吴火安', town_id=13, start_time=days_ago(6), duration=7800, distance=7.4, status=1),
        ]
        for row in rows:
            Patrol.objects.create(**row)

    def _events(self):
        Event.objects.create(id=1, ranger_id=1, ranger_name='张山林', town_id=11, type=2, description='东坪坡发现枯枝落叶堆积，存在火灾隐患', lng=106.72, lat=31.836, address='化成镇东坪坡', status=0)
        Event.objects.create(id=2, ranger_id=4, ranger_name='赵青山', town_id=12, type=1, description='鼎山村北侧出现疑似烟点，已上报', lng=106.66, lat=31.73, address='鼎山村北', status=1, created_at=days_ago(1 / 24))
        Event.objects.create(id=3, ranger_id=2, ranger_name='李树生', town_id=11, type=3, description='发现违规采伐行为', lng=106.8, lat=31.79, address='白坪村水库旁', status=2, handle_note='已移交森警支队处理', handle_time=days_ago(2), created_at=days_ago(3))
        Event.objects.create(id=4, ranger_id=7, ranger_name='吴火安', town_id=13, type=4, description='入山路口护栏损坏', lng=106.89, lat=31.91, address='光辉镇西入口', status=0, created_at=days_ago(0.5))
        Event.objects.create(id=5, ranger_id=3, ranger_name='王护林', town_id=12, type=2, description='枯树倾倒横阻巡护道路', status=1, created_at=days_ago(1))

    def _training(self):
        Course.objects.create(id=1, title='森林防火基础常识', type=1, duration=3600, sort=1, status=1)
        Course.objects.create(id=2, title='野外火源识别与处置', type=1, duration=1800, sort=2, status=1)
        Course.objects.create(id=3, title='护林员巡护打点规范', type=2, sort=3, status=1)
        Course.objects.create(id=4, title='森林法规与生态红线', type=2, sort=4, status=1)
        Course.objects.create(id=5, title='防汛与森林火险联动预警', type=1, duration=2700, sort=5, status=0)
        StudyRecord.objects.create(id=1, ranger_id=1, ranger_name='张山林', course_id=1, course_title='森林防火基础常识', progress=100, finish_time=days_ago(10), created_at=days_ago(10))
        StudyRecord.objects.create(id=2, ranger_id=1, course_id=2, course_title='野外火源识别与处置', progress=65, created_at=days_ago(5))
        StudyRecord.objects.create(id=3, ranger_id=2, course_id=1, course_title='森林防火基础常识', progress=100, finish_time=days_ago(12), created_at=days_ago(12))
        StudyRecord.objects.create(id=4, ranger_id=3, course_id=3, course_title='护林员巡护打点规范', progress=40, created_at=days_ago(3))
        StudyRecord.objects.create(id=5, ranger_id=4, course_id=1, course_title='森林防火基础常识', progress=100, finish_time=days_ago(8), created_at=days_ago(8))
        StudyRecord.objects.create(id=6, ranger_id=7, course_id=2, course_title='野外火源识别与处置', progress=100, finish_time=days_ago(4), created_at=days_ago(4))

    def _assessment(self):
        AssessmentRule.objects.create(
            id=1, name='2026年度考核规则（默认）', patrol_weight=40, event_weight=30, study_weight=30,
            patrol_target=100, checkin_target=20, effective_date=date(2026, 1, 1),
        )
        rows = [
            dict(id=1, ranger_id=1, ranger_name='张山林', town_id=11, year=2026, month=9, patrol_score=35, event_score=28, study_score=25, total_score=88, rank_in_town=1),
            dict(id=2, ranger_id=2, ranger_name='李树生', town_id=11, year=2026, month=9, patrol_score=31, event_score=26, study_score=22, total_score=79, rank_in_town=2),
            dict(id=3, ranger_id=3, ranger_name='王护林', town_id=12, year=2026, month=9, patrol_score=27, event_score=22, study_score=23, total_score=72, rank_in_town=1),
            dict(id=4, ranger_id=4, ranger_name='赵青山', town_id=12, year=2026, month=9, patrol_score=38, event_score=30, study_score=24, total_score=92, rank_in_town=2),
            dict(id=5, ranger_id=5, ranger_name='陈松林', town_id=13, year=2026, month=9, patrol_score=19, event_score=18, study_score=18, total_score=55, rank_in_town=1),
        ]
        for row in rows:
            AssessmentResult.objects.create(**row)

    def _warnings(self):
        Warning.objects.create(id=1, type='no-patrol', title='连续3天未巡护', ranger_name='陈松林', town_name='光辉镇', detail='陈松林已连续3天无巡护记录', level='high', status=0, created_at=days_ago(0.2))
        Warning.objects.create(id=2, type='event-timeout', title='火情事件超时未处理', town_name='鼎山镇', detail='事件#2 上报已超过2小时未闭环', level='high', status=0, created_at=days_ago(0.5))
        Warning.objects.create(id=3, type='area-not-covered', title='重点区域本月未覆盖', ranger_name='郑水库', town_name='光辉镇', detail='西南片区本月未打卡任何重点区域', level='medium', status=0, created_at=days_ago(1))
        Warning.objects.create(id=4, type='abnormal-track', title='巡护里程异常', ranger_name='王护林', town_name='鼎山镇', detail='昨日巡护里程3.2km 低于阈值1km阈值附近', level='low', status=1, created_at=days_ago(1))

    def _external(self):
        rows = [
            dict(id=1, slug='national-patrol', name='全国生态护林员联动管理系统', category='treasury', priority='p0', auth_type='token', enabled=False, direction='bidirectional', desc='巡护轨迹、打卡数据同步，避免两头录入', endpoints=['/api/external/patrol/sync', '/api/external/checkin/sync']),
            dict(id=2, slug='province-fire-report', name='省火情监测即报系统', category='treasury', priority='p0', auth_type='token', enabled=False, direction='bidirectional', desc='火情事件推送与核销闭环', endpoints=['/api/external/fire/report', '/api/external/fire/cancel']),
            dict(id=3, slug='city-emergency', name='市应急管理局指挥调度接口', category='city', priority='p1', auth_type='sign', enabled=False, direction='out', desc='火情确认后推送至火灾科学扑救组', endpoints=['/api/external/emergency/event']),
            dict(id=4, slug='city-meteorology', name='市气象局火险预警数据', category='city', priority='p1', auth_type='none', enabled=False, direction='in', desc='火险预警信息推送，辅助巡护决策', endpoints=['/api/external/weather/forecast']),
            dict(id=5, slug='province-data-share', name='四川省政务信息资源共享平台', category='province', priority='p2', auth_type='oauth', enabled=False, direction='in', desc='护林员基础信息核验、资源数据联动', endpoints=['/api/external/identity/verify']),
            dict(id=6, slug='city-river-lake', name='巴中市河湖管理信息系统', category='city', priority='p2', auth_type='token', enabled=False, direction='in', desc='生态红线、水源保护区空间数据对齐', endpoints=['/api/external/space/boundary']),
            dict(id=7, slug='badu-weather-broadcast', name='巴中市防汛预警广播平台(应急广播)', category='city', priority='p2', auth_type='token', enabled=False, direction='out', desc='电话短信预警、自动发布预警补充通道', endpoints=['/api/external/broadcast/push']),
        ]
        for row in rows:
            ExternalSystem.objects.create(**row)

    def _users(self):
        AdminUser.objects.create(id=1, username='admin', name='区级管理员', role='super')
        AdminUser.objects.create(id=2, username='zhenzhang', name='化成镇管理员', role='town', town_id=11)
        AdminUser.objects.create(id=3, username='quzhang', name='区防火办', role='district')
