// 第三方系统对接适配层（预留）
// 抽象对接接口，供后续接入各第三方系统。当前返回模拟结果/占位，但接口签名即为正式对接契约。

import { ExternalSystem } from '@/types';
import { store } from '@/data/memoryDB';

export interface IntegrateResult<T = unknown> {
  success: boolean;
  code: number;
  msg: string;
  data?: T;
  // 预留：真实对接时的回执/流水号
  traceId?: string;
  systemSlug?: string;
}

export interface PushPayload {
  [k: string]: unknown;
}

// ---------------- 适配器注册表 ----------------
export interface ExternalAdapter {
  slug: string;
  system(): ExternalSystem | undefined;
  enabled(): boolean;
  push(payload: PushPayload): Promise<IntegrateResult>;
  pull?(params: Record<string, unknown>): Promise<IntegrateResult>;
}

abstract class BaseAdapter implements ExternalAdapter {
  abstract slug: string;
  system(): ExternalSystem | undefined {
    return store.externalSystems.find(s => s.slug === this.slug);
  }
  enabled(): boolean {
    return this.system()?.enabled ?? false;
  }
  abstract push(payload: PushPayload): Promise<IntegrateResult>;
  pull?(params: Record<string, unknown>): Promise<IntegrateResult> {
    return this.dispatch('拉取数据', params);
  }
  // 统一封装：校验启用状态 + 生成流水号 + 记录操作（正式实现会替换为真实 HTTP 调用）
  protected async dispatch(action: string, payload: PushPayload): Promise<IntegrateResult> {
    const sys = this.system();
    const traceId = `T${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    if (!sys) return { success: false, code: 404, msg: '未注册系统', traceId, systemSlug: this.slug };
    if (!sys.enabled) {
      return { success: false, code: 403, msg: `系统「${sys.name}」未启用对接`, traceId, systemSlug: this.slug };
    }
    // TODO(正式对接)：在此实现真实鉴权与 HTTP 请求（sys.baseUrl + sys.endpoints[action]），
    // 并把关键操作写入操作日志。
    return {
      success: true,
      code: 0,
      msg: `${sys.name} ${action} 已受理（对接占位）`,
      data: { action, payload, receivedAt: new Date().toISOString() },
      traceId,
      systemSlug: this.slug,
    };
  }
}

// ① 全国生态护林员联动管理系统 —— 巡护轨迹/打卡同步（P0 第一优先级）
export class NationalPatrolAdapter extends BaseAdapter {
  slug = 'national-patrol';
  push(payload: PushPayload) {
    return this.dispatch('巡护/打卡数据同步', payload);
  }
}

// ② 省火情监测即报系统 —— 火情上报与核销（P0 第一优先级）
export class ProvinceFireReportAdapter extends BaseAdapter {
  slug = 'province-fire-report';
  push(payload: PushPayload) {
    return this.dispatch('火情上报推送到省即报系统', payload);
  }
  pull(params: Record<string, unknown>) {
    return this.dispatch('拉取卫星热点核销状态', params);
  }
}

// ③ 市应急管理局指挥调度接口 —— 火情推送扑救组（P1）
export class CityEmergencyAdapter extends BaseAdapter {
  slug = 'city-emergency';
  push(payload: PushPayload) {
    return this.dispatch('火情推送至应急指挥', payload);
  }
}

// ④ 市气象局火险预警 —— 火险等级数据辅助巡护决策（P1）
export class CityMeteorologyAdapter extends BaseAdapter {
  slug = 'city-meteorology';
  push(payload: PushPayload) {
    return this.dispatch('火险预警订阅/同步', payload);
  }
}

// ⑤ 四川省政务信息资源共享平台 —— 人员/资源数据核验（P2）
export class ProvinceDataShareAdapter extends BaseAdapter {
  slug = 'province-data-share';
  push(payload: PushPayload) {
    return this.dispatch('基础信息核验请求', payload);
  }
}

// ⑥ 巴中市河湖管理信息系统 —— 生态红线/水源保护区空间对齐（P2）
export class CityRiverLakeAdapter extends BaseAdapter {
  slug = 'city-river-lake';
  push(payload: PushPayload) {
    return this.dispatch('空间边界对齐数据拉取', payload);
  }
}

// ⑦ 巴中市防汛预警广播平台 —— 应急通知补充通道（P2）
export class WeatherBroadcastAdapter extends BaseAdapter {
  slug = 'badu-weather-broadcast';
  push(payload: PushPayload) {
    return this.dispatch('应急广播预警推送', payload);
  }
}

// 适配器工厂：按 slug 获取对应适配器
export function getAdapter(slug: string): ExternalAdapter | undefined {
  const map: Record<string, ExternalAdapter> = {
    'national-patrol': new NationalPatrolAdapter(),
    'province-fire-report': new ProvinceFireReportAdapter(),
    'city-emergency': new CityEmergencyAdapter(),
    'city-meteorology': new CityMeteorologyAdapter(),
    'province-data-share': new ProvinceDataShareAdapter(),
    'city-river-lake': new CityRiverLakeAdapter(),
    'badu-weather-broadcast': new WeatherBroadcastAdapter(),
  };
  return map[slug];
}

export function listAdapters(): ExternalAdapter[] {
  return [
    new NationalPatrolAdapter(),
    new ProvinceFireReportAdapter(),
    new CityEmergencyAdapter(),
    new CityMeteorologyAdapter(),
    new ProvinceDataShareAdapter(),
    new CityRiverLakeAdapter(),
    new WeatherBroadcastAdapter(),
  ];
}