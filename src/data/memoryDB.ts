// 内存数据仓库 —— 数据访问层
// 当前用于可运行、可预览的演示环境；后续可平滑替换为真实数据库(Postgres/MySQL)实现同接口。

import {
  Ranger,
  OrgNode,
  ResponsibilityArea,
  PatrolRecord,
  EventReport,
  Course,
  StudyRecord,
  AssessmentRule,
  AssessmentResult,
  WarningItem,
  ExternalSystem,
  AdminUser,
  EventType,
} from '@/types';

export interface DB {
  rangers: Ranger[];
  orgs: OrgNode[];
  areas: ResponsibilityArea[];
  patrols: PatrolRecord[];
  events: EventReport[];
  courses: Course[];
  studyRecords: StudyRecord[];
  rules: AssessmentRule[];
  assessments: AssessmentResult[];
  warnings: WarningItem[];
  externalSystems: ExternalSystem[];
  adminUsers: AdminUser[];
}

let seq = 1000;
export function nextId(): number {
  return ++seq;
}

// ---------------- 种子数据 ----------------
const now = new Date();
const today = now.toISOString();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

export const seedDB: DB = {
  orgs: [
    { id: 1, name: '巴州区', parentId: 0, level: 1 },
    { id: 2, name: '平昌县', parentId: 0, level: 1 },
    { id: 3, name: '通江县', parentId: 0, level: 1 },
    { id: 11, name: '化成镇', parentId: 1, level: 2 },
    { id: 12, name: '鼎山镇', parentId: 1, level: 2 },
    { id: 13, name: '光辉镇', parentId: 1, level: 2 },
    { id: 101, name: '化成村', parentId: 11, level: 3 },
    { id: 102, name: '白坪村', parentId: 11, level: 3 },
    { id: 103, name: '鼎山村', parentId: 12, level: 3 },
  ],
  rangers: [
    { id: 1, name: '张山林', phone: '13800000001', idCard: '511902199001011234', townId: 11, villageId: 101, areaId: 1, avatarUrl: '', status: 1, hireDate: '2023-03-01', online: true, monthDistance: 126.5, monthCheckinRate: 92, score: 88, createdAt: '2026-01-05', updatedAt: today },
    { id: 2, name: '李树生', phone: '13800000002', idCard: '511902198802012345', townId: 11, villageId: 102, areaId: 2, status: 1, hireDate: '2022-06-15', online: true, monthDistance: 98.2, monthCheckinRate: 85, score: 79, createdAt: '2026-01-06', updatedAt: today },
    { id: 3, name: '王护林', phone: '13800000003', idCard: '511902199203053456', townId: 12, villageId: 103, areaId: 3, status: 1, hireDate: '2024-01-10', online: false, monthDistance: 76.9, monthCheckinRate: 78, score: 72, createdAt: '2026-01-08', updatedAt: daysAgo(1) },
    { id: 4, name: '赵青山', phone: '13800000004', townId: 12, status: 1, hireDate: '2021-09-20', online: true, monthDistance: 152.3, monthCheckinRate: 96, score: 92, createdAt: '2026-01-10', updatedAt: today },
    { id: 5, name: '陈松林', phone: '13800000005', townId: 13, status: 1, hireDate: '2023-08-01', online: false, monthDistance: 45.6, monthCheckinRate: 60, score: 55, createdAt: '2026-02-01', updatedAt: daysAgo(2) },
    { id: 6, name: '周树林', phone: '13800000006', townId: 13, status: 0, hireDate: '2020-05-10', online: false, monthDistance: 0, monthCheckinRate: 0, score: 0, createdAt: '2026-02-05', updatedAt: daysAgo(30) },
    { id: 7, name: '吴火安', phone: '13800000007', townId: 13, status: 1, hireDate: '2024-05-20', online: true, monthDistance: 88.4, monthCheckinRate: 88, score: 81, createdAt: '2026-03-01', updatedAt: today },
    { id: 8, name: '郑水库', phone: '13800000008', townId: 13, status: 1, hireDate: '2023-11-11', online: false, monthDistance: 67.8, monthCheckinRate: 74, score: 68, createdAt: '2026-03-10', updatedAt: daysAgo(1) },
  ],
  areas: [
    { id: 1, name: '化成镇东片区', townId: 11, townName: '化成镇', boundary: [[106.7, 31.82], [106.75, 31.82], [106.75, 31.85], [106.7, 31.85]], areaSize: 12.5, keyPoints: [{ name: '东坪瞭望塔', lng: 106.72, lat: 31.835, radius: 200 }], rangerName: '张山林', createdAt: '2026-01-10' },
    { id: 2, name: '白坪水源保护区', townId: 11, townName: '化成镇', boundary: [[106.78, 31.78], [106.83, 31.78], [106.83, 31.82], [106.78, 31.82]], areaSize: 8.8, keyPoints: [{ name: '水库大坝', lng: 106.8, lat: 31.8, radius: 150 }, { name: '南侧闸口', lng: 106.81, lat: 31.79, radius: 100 }], rangerName: '李树生', createdAt: '2026-01-10' },
    { id: 3, name: '鼎山防火核心区', townId: 12, townName: '鼎山镇', boundary: [[106.62, 31.7], [106.68, 31.7], [106.68, 31.75], [106.62, 31.75]], areaSize: 9.2, keyPoints: [{ name: '鼎山制高点', lng: 106.65, lat: 31.725, radius: 180 }], rangerName: '王护林', createdAt: '2026-02-01' },
    { id: 4, name: '光辉镇西南片区', townId: 13, townName: '光辉镇', boundary: [[106.88, 31.9], [106.93, 31.9], [106.93, 31.94], [106.88, 31.94]], areaSize: 15.1, keyPoints: [], rangerName: '陈松林', createdAt: '2026-03-05' },
  ],
  patrols: [
    { id: 1, rangerId: 1, rangerName: '张山林', townId: 11, startTime: daysAgo(0), duration: 7200, distance: 6.5, status: 1, createdAt: today, keyPointsHit: [{ pointName: '东坪瞭望塔', time: today }] },
    { id: 2, rangerId: 2, rangerName: '李树生', townId: 11, startTime: daysAgo(0), duration: 5400, distance: 4.8, status: 1, createdAt: today },
    { id: 3, rangerId: 4, rangerName: '赵青山', townId: 12, startTime: daysAgo(0), duration: 8100, distance: 7.9, status: 1, createdAt: today },
    { id: 4, rangerId: 1, rangerName: '张山林', townId: 11, startTime: daysAgo(1), duration: 6600, distance: 6.0, status: 1, createdAt: daysAgo(1) },
    { id: 5, rangerId: 3, rangerName: '王护林', townId: 12, startTime: daysAgo(1), duration: 4800, distance: 3.2, status: 2, createdAt: daysAgo(1) },
    { id: 6, rangerId: 7, rangerName: '吴火安', townId: 13, startTime: daysAgo(2), duration: 8000, distance: 8.1, status: 1, createdAt: daysAgo(2) },
    { id: 7, rangerId: 4, rangerName: '赵青山', townId: 12, startTime: daysAgo(3), duration: 9000, distance: 9.0, status: 1, createdAt: daysAgo(3) },
    { id: 8, rangerId: 1, rangerName: '张山林', townId: 11, startTime: daysAgo(4), duration: 7200, distance: 6.9, status: 1, createdAt: daysAgo(4) },
    { id: 9, rangerId: 2, rangerName: '李树生', townId: 11, startTime: daysAgo(5), duration: 6000, distance: 5.5, status: 1, createdAt: daysAgo(5) },
    { id: 10, rangerId: 7, rangerName: '吴火安', townId: 13, startTime: daysAgo(6), duration: 7800, distance: 7.4, status: 1, createdAt: daysAgo(6) },
  ],
  events: [
    { id: 1, rangerId: 1, rangerName: '张山林', townId: 11, townName: '化成镇', type: 2, description: '东坪坡发现枯枝落叶堆积，存在火灾隐患', images: [], lng: 106.72, lat: 31.836, address: '化成镇东坪坡', status: 0, createdAt: now.toISOString() },
    { id: 2, rangerId: 4, rangerName: '赵青山', townId: 12, townName: '鼎山镇', type: 1, description: '鼎山村北侧出现疑似烟点，已上报', images: [], lng: 106.66, lat: 31.73, address: '鼎山村北', status: 1, createdAt: daysAgo(1 / 24) },
    { id: 3, rangerId: 2, rangerName: '李树生', townId: 11, townName: '化成镇', type: 3, description: '发现违规采伐行为', images: [], lng: 106.8, lat: 31.79, address: '白坪村水库旁', status: 2, handleNote: '已移交森警支队处理', handleTime: daysAgo(2), createdAt: daysAgo(3) },
    { id: 4, rangerId: 7, rangerName: '吴火安', townId: 13, townName: '光辉镇', type: 4, description: '入山路口护栏损坏', images: [], lng: 106.89, lat: 31.91, address: '光辉镇西入口', status: 0, createdAt: daysAgo(0.5) },
    { id: 5, rangerId: 3, rangerName: '王护林', townId: 12, townName: '鼎山镇', type: 2, description: '枯树倾倒横阻巡护道路', images: [], status: 1, createdAt: daysAgo(1) },
  ],
  courses: [
    { id: 1, title: '森林防火基础常识', type: 1, duration: 3600, sort: 1, status: 1, createdAt: '2026-01-01' },
    { id: 2, title: '野外火源识别与处置', type: 1, duration: 1800, sort: 2, status: 1, createdAt: '2026-01-05' },
    { id: 3, title: '护林员巡护打点规范', type: 2, sort: 3, status: 1, createdAt: '2026-01-10' },
    { id: 4, title: '森林法规与生态红线', type: 2, sort: 4, status: 1, createdAt: '2026-02-01' },
    { id: 5, title: '防汛与森林火险联动预警', type: 1, duration: 2700, sort: 5, status: 0, createdAt: '2026-03-01' },
  ],
  studyRecords: [
    { id: 1, rangerId: 1, rangerName: '张山林', courseId: 1, courseTitle: '森林防火基础常识', progress: 100, finishTime: daysAgo(10), createdAt: daysAgo(10) },
    { id: 2, rangerId: 1, courseId: 2, courseTitle: '野外火源识别与处置', progress: 65, createdAt: daysAgo(5) },
    { id: 3, rangerId: 2, courseId: 1, courseTitle: '森林防火基础常识', progress: 100, finishTime: daysAgo(12), createdAt: daysAgo(12) },
    { id: 4, rangerId: 3, courseId: 3, courseTitle: '护林员巡护打点规范', progress: 40, createdAt: daysAgo(3) },
    { id: 5, rangerId: 4, courseId: 1, courseTitle: '森林防火基础常识', progress: 100, finishTime: daysAgo(8), createdAt: daysAgo(8) },
    { id: 6, rangerId: 7, courseId: 2, courseTitle: '野外火源识别与处置', progress: 100, finishTime: daysAgo(4), createdAt: daysAgo(4) },
  ],
  rules: [
    { id: 1, name: '2026年度考核规则（默认）', patrolWeight: 40, eventWeight: 30, studyWeight: 30, patrolTarget: 100, checkinTarget: 20, effectiveDate: '2026-01-01', createdAt: '2025-12-20' },
  ],
  assessments: [
    { id: 1, rangerId: 1, rangerName: '张山林', townId: 11, townName: '化成镇', year: 2026, month: 9, patrolScore: 35, eventScore: 28, studyScore: 25, totalScore: 88, rankInTown: 1, createdAt: today },
    { id: 2, rangerId: 2, rangerName: '李树生', townId: 11, townName: '化成镇', year: 2026, month: 9, patrolScore: 31, eventScore: 26, studyScore: 22, totalScore: 79, rankInTown: 2, createdAt: today },
    { id: 3, rangerId: 3, rangerName: '王护林', townId: 12, townName: '鼎山镇', year: 2026, month: 9, patrolScore: 27, eventScore: 22, studyScore: 23, totalScore: 72, rankInTown: 1, createdAt: today },
    { id: 4, rangerId: 4, rangerName: '赵青山', townId: 12, townName: '鼎山镇', year: 2026, month: 9, patrolScore: 38, eventScore: 30, studyScore: 24, totalScore: 92, rankInTown: 2, createdAt: today },
    { id: 5, rangerId: 5, rangerName: '陈松林', townId: 13, townName: '光辉镇', year: 2026, month: 9, patrolScore: 19, eventScore: 18, studyScore: 18, totalScore: 55, rankInTown: 1, createdAt: today },
  ],
  warnings: [
    { id: 1, type: 'no-patrol', title: '连续3天未巡护', rangerName: '陈松林', townName: '光辉镇', detail: '陈松林已连续3天无巡护记录', level: 'high', status: 0, createdAt: daysAgo(0.2) },
    { id: 2, type: 'event-timeout', title: '火情事件超时未处理', townName: '鼎山镇', detail: '事件#2 上报已超过2小时未闭环', level: 'high', status: 0, createdAt: daysAgo(0.5) },
    { id: 3, type: 'area-not-covered', title: '重点区域本月未覆盖', rangerName: '郑水库', townName: '光辉镇', detail: '西南片区本月未打卡任何重点区域', level: 'medium', status: 0, createdAt: daysAgo(1) },
    { id: 4, type: 'abnormal-track', title: '巡护里程异常', rangerName: '王护林', townName: '鼎山镇', detail: '昨日巡护里程3.2km 低于阈值1km阈值附近', level: 'low', status: 1, createdAt: daysAgo(1) },
  ],
  externalSystems: [
    { id: 1, slug: 'national-patrol', name: '全国生态护林员联动管理系统', category: 'treasury', priority: 'p0', authType: 'token', enabled: false, direction: 'bidirectional', desc: '巡护轨迹、打卡数据同步，避免两头录入', endpoints: ['/api/external/patrol/sync', '/api/external/checkin/sync'] },
    { id: 2, slug: 'province-fire-report', name: '省火情监测即报系统', category: 'treasury', priority: 'p0', authType: 'token', enabled: false, direction: 'bidirectional', desc: '火情事件推送与核销闭环', endpoints: ['/api/external/fire/report', '/api/external/fire/cancel'] },
    { id: 3, slug: 'city-emergency', name: '市应急管理局指挥调度接口', category: 'city', priority: 'p1', authType: 'sign', enabled: false, direction: 'out', desc: '火情确认后推送至火灾科学扑救组', endpoints: ['/api/external/emergency/event'] },
    { id: 4, slug: 'city-meteorology', name: '市气象局火险预警数据', category: 'city', priority: 'p1', authType: 'none', enabled: false, direction: 'in', desc: '火险预警信息推送，辅助巡护决策', endpoints: ['/api/external/weather/forecast'] },
    { id: 5, slug: 'province-data-share', name: '四川省政务信息资源共享平台', category: 'province', priority: 'p2', authType: 'oauth', enabled: false, direction: 'in', desc: '护林员基础信息核验、资源数据联动', endpoints: ['/api/external/identity/verify'] },
    { id: 6, slug: 'city-river-lake', name: '巴中市河湖管理信息系统', category: 'city', priority: 'p2', authType: 'token', enabled: false, direction: 'in', desc: '生态红线、水源保护区空间数据对齐', endpoints: ['/api/external/space/boundary'] },
    { id: 7, slug: 'badu-weather-broadcast', name: '巴中市防汛预警广播平台(应急广播)', category: 'city', priority: 'p2', authType: 'token', enabled: false, direction: 'out', desc: '电话短信预警、自动发布预警补充通道', endpoints: ['/api/external/broadcast/push'] },
  ],
  adminUsers: [
    { id: 1, username: 'admin', name: '区级管理员', role: 'super' },
    { id: 2, username: 'zhenzhang', name: '化成镇管理员', role: 'town', townId: 11 },
    { id: 3, username: 'quzhang', name: '区防火办', role: 'district' },
  ],
};

const db: DB = structuredClone(seedDB);
export const store = db;

export function resetDB(): void {
  const fresh: DB = structuredClone(seedDB);
  Object.keys(db).forEach(k => {
    (db as unknown as Record<string, unknown>)[k] = (fresh as unknown as Record<string, unknown>)[k];
  });
  seq = 1000;
}