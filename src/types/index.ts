// 领域类型定义 —— 护林员智能管理平台（管理端）

export interface Ranger {
  id: number;
  name: string;
  phone: string;
  phoneMasked?: string;
  idCard?: string;
  townId: number;
  villageId?: number | null;
  areaId?: number | null;
  avatarUrl?: string;
  status: 1 | 0; // 1在岗 0离职
  hireDate?: string | null;
  online: boolean; // 实时在线状态
  createdAt: string;
  updatedAt: string;
  monthDistance?: number;
  monthCheckinRate?: number;
  score?: number;
  townName?: string;
  villageName?: string | null;
  areaName?: string | null;
}

export interface RangerWritePayload {
  name: string;
  phone: string;
  idCard?: string;
  townId: number;
  villageId?: number | null;
  areaId?: number | null;
  hireDate?: string | null;
  status: 1 | 0;
}

export interface RangerListData {
  list: Ranger[];
  total: number;
  page: number;
  pageSize: number;
  size: number;
}

export interface OrgNode {
  id: number;
  name: string;
  parentId: number;
  parentName?: string;
  level: 1 | 2 | 3;
  levelName?: string;
}

export interface OrgWritePayload {
  name: string;
  level: 1 | 2 | 3;
  parentId: number;
}

export interface KeyPoint {
  name: string;
  lng: number;
  lat: number;
  radius: number; // 米
}

export interface ResponsibilityArea {
  id: number;
  name: string;
  townId: number;
  townName?: string;
  boundary: [number, number][];
  areaSize?: number | null;
  keyPoints: KeyPoint[];
  rangerName?: string | null;
  createdAt: string;
}

export interface AreaWritePayload {
  name: string;
  townId: number;
  areaSize?: number | null;
  keyPoints?: KeyPoint[];
  boundary?: [number, number][];
}

export interface PatrolRecord {
  id: number;
  rangerId: number;
  rangerName?: string;
  townId?: number;
  startTime: string;
  endTime?: string;
  distance?: number; // km
  duration?: number; // 秒
  track?: { lng: number; lat: number; ts: number }[];
  keyPointsHit?: { pointName: string; time: string }[];
  status: 0 | 1 | 2; // 0进行中 1已完成 2异常
  createdAt: string;
}

export type EventType = 1 | 2 | 3 | 4; // 1火情 2隐患 3破坏森林资源 4其他
export type EventStatus = 0 | 1 | 2 | 3; // 0待处理 1处理中 2已闭环 3已驳回

export interface EventReport {
  id: number;
  rangerId?: number | null;
  rangerName?: string | null;
  townId?: number | null;
  townName?: string;
  type: EventType;
  typeName?: string;
  description: string;
  images?: string[];
  lng?: number | null;
  lat?: number | null;
  address?: string;
  status: EventStatus;
  statusName?: string;
  handlerId?: number | null;
  handlerName?: string;
  handleNote?: string;
  handleTime?: string | null;
  createdAt: string;
}

export interface EventHandlePayload {
  status: EventStatus;
  note?: string;
  handlerName?: string;
}

export interface EventListData {
  list: EventReport[];
  total: number;
}

export interface EventStats {
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  total: number;
  timeoutEvents: number;
}

export interface Course {
  id: number;
  title: string;
  coverUrl?: string;
  type: 1 | 2;
  typeName?: string;
  contentUrl?: string;
  duration?: number | null;
  sort: number;
  status: 1 | 0;
  statusName?: string;
  createdAt: string;
}

export interface CourseWritePayload {
  title: string;
  coverUrl?: string;
  type: 1 | 2;
  contentUrl?: string;
  duration?: number | null;
  sort?: number;
  status: 1 | 0;
}

export interface StudyRecord {
  id: number;
  rangerId: number;
  rangerName?: string;
  courseId: number;
  courseTitle?: string;
  progress: number;
  finishTime?: string | null;
  createdAt: string;
}

export interface StudyStats {
  totalCourses: number;
  totalStudyUnits: number;
  finishedUnits: number;
  completionRate: number;
  totalRangers: number;
}

export interface StudyListData {
  records: StudyRecord[];
  stats: StudyStats;
}

export interface AssessmentRule {
  id: number;
  name: string;
  patrolWeight: number;
  eventWeight: number;
  studyWeight: number;
  patrolTarget?: number | null;
  checkinTarget?: number | null;
  effectiveDate?: string | null;
  createdAt: string;
}

export interface AssessmentRuleWritePayload {
  name: string;
  patrolWeight: number;
  eventWeight: number;
  studyWeight: number;
  patrolTarget?: number | null;
  checkinTarget?: number | null;
  effectiveDate?: string | null;
}

export interface AssessmentResult {
  id: number;
  rangerId: number;
  rangerName?: string;
  townId?: number | null;
  townName?: string;
  year: number;
  month: number;
  patrolScore: number;
  eventScore: number;
  studyScore: number;
  totalScore: number;
  rankInTown?: number | null;
  level?: string;
  createdAt: string;
}

export interface AssessmentListData {
  list: AssessmentResult[];
  total: number;
  year: number;
  month: number;
}

export interface AssessmentRecomputePayload {
  year: number;
  month: number;
}

export type WarningType = 'no-patrol' | 'abnormal-track' | 'area-not-covered' | 'event-timeout';
export type WarningLevel = 'high' | 'medium' | 'low';

export interface WarningRule {
  id: number;
  type: WarningType;
  name: string;
  thresholdDesc: string;
  notifyTo: string;
}

export interface WarningItem {
  id: number;
  type: WarningType;
  typeName?: string;
  title: string;
  rangerName?: string;
  townName?: string;
  detail: string;
  level: WarningLevel;
  levelName?: string;
  status: 0 | 1;
  createdAt: string;
}

export interface WarningWritePayload {
  id: number;
  status: 0 | 1;
}

// 第三方对接系统类型（预留适配层）
export interface ExternalSystem {
  id: number;
  slug: string;
  name: string;
  category: 'treasury' | 'province' | 'city' | 'advice';
  priority: 'p0' | 'p1' | 'p2';
  baseUrl?: string;
  authType: 'none' | 'token' | 'oauth' | 'sign';
  enabled: boolean;
  direction: 'in' | 'out' | 'bidirectional';
  desc: string;
  endpoints: string[];
  hasAdapter?: boolean;
}

export type AdminRole = 'super' | 'district' | 'town';

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: AdminRole;
  roleName?: string;
  townId?: number | null;
  townName?: string | null;
}

export interface AdminUserWritePayload {
  username: string;
  name: string;
  role: AdminRole;
  townId?: number | null;
}

export interface DashboardStats {
  rangerTotal: number;
  onlineCount: number;
  todayPatrolRate: number;
  pendingEvents: number;
  todayDistance: number;
  checkinAvgRate: number;
  weeklyTrend: { date: string; patrolCount: number; distance: number }[];
  eventTypeStats: { type: EventType; typeName: string; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}