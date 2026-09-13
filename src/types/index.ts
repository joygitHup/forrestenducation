// 领域类型定义 —— 护林员智能管理平台（管理端）

export interface Ranger {
  id: number;
  name: string;
  phone: string;
  idCard?: string;
  townId: number;
  villageId?: number;
  areaId?: number;
  avatarUrl?: string;
  status: 1 | 0; // 1在岗 0离职
  hireDate?: string;
  online: boolean; // 实时在线状态
  createdAt: string;
  updatedAt: string;
  // 统计派生字段
  monthDistance?: number; // 本月巡护里程(km)
  monthCheckinRate?: number; // 本月打点完成率 %
  score?: number; // 综合履职评分
}

export interface OrgNode {
  id: number;
  name: string;
  parentId: number;
  level: 1 | 2 | 3; // 1区 2乡镇 3村
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
  areaSize?: number; // 平方公里
  keyPoints: KeyPoint[];
  rangerName?: string;
  createdAt: string;
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
  rangerId: number;
  rangerName?: string;
  townId?: number;
  townName?: string;
  type: EventType;
  description: string;
  images?: string[];
  lng?: number;
  lat?: number;
  address?: string;
  status: EventStatus;
  handlerId?: number;
  handlerName?: string;
  handleNote?: string;
  handleTime?: string;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  coverUrl?: string;
  type: 1 | 2; // 1视频 2图文
  contentUrl?: string;
  duration?: number; // 秒
  sort: number;
  status: 1 | 0;
  createdAt: string;
}

export interface StudyRecord {
  id: number;
  rangerId: number;
  rangerName?: string;
  courseId: number;
  courseTitle?: string;
  progress: number; // 百分比
  finishTime?: string;
  createdAt: string;
}

export interface AssessmentRule {
  id: number;
  name: string;
  patrolWeight: number; // %
  eventWeight: number;
  studyWeight: number;
  patrolTarget?: number; // 月巡护里程目标 km
  checkinTarget?: number; // 月打点次数目标
  effectiveDate?: string;
  createdAt: string;
}

export interface AssessmentResult {
  id: number;
  rangerId: number;
  rangerName?: string;
  townId?: number;
  townName?: string;
  year: number;
  month: number;
  patrolScore: number;
  eventScore: number;
  studyScore: number;
  totalScore: number;
  rankInTown?: number;
  createdAt: string;
}

export interface WarningRule {
  id: number;
  type: 'no-patrol' | 'abnormal-track' | 'area-not-covered' | 'event-timeout';
  name: string;
  thresholdDesc: string;
  notifyTo: string;
}

export interface WarningItem {
  id: number;
  type: 'no-patrol' | 'abnormal-track' | 'area-not-covered' | 'event-timeout';
  title: string;
  rangerName?: string;
  townName?: string;
  detail: string;
  level: 'high' | 'medium' | 'low';
  status: 0 | 1; // 0未处理 1已处置
  createdAt: string;
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

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: 'super' | 'district' | 'town';
  townId?: number;
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