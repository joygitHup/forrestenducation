// 培训管理服务

import { store, nextId } from '@/data/memoryDB';
import { Course, StudyRecord } from '@/types';

export function listCourses(filters?: { status?: string }) {
  let list = [...store.courses];
  if (filters?.status !== undefined && filters.status !== '') {
    list = list.filter(c => c.status === Number(filters.status));
  }
  return list.sort((a, b) => a.sort - b.sort);
}

export function getCourse(id: number): Course | null {
  return store.courses.find(c => c.id === id) ?? null;
}

export interface CourseInput {
  title: string;
  coverUrl?: string;
  type: 1 | 2;
  contentUrl?: string;
  duration?: number;
  sort?: number;
  status: 1 | 0;
}

export function createCourse(input: CourseInput): Course {
  const course: Course = {
    id: nextId(),
    title: input.title,
    coverUrl: input.coverUrl,
    type: input.type,
    contentUrl: input.contentUrl,
    duration: input.duration,
    sort: input.sort ?? 0,
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  store.courses.push(course);
  return course;
}

export function updateCourse(id: number, input: Partial<CourseInput>): Course | null {
  const idx = store.courses.findIndex(c => c.id === id);
  if (idx < 0) return null;
  store.courses[idx] = { ...store.courses[idx], ...input, id };
  return store.courses[idx];
}

export function listStudyRecords(filters?: { courseId?: number; rangerId?: number }) {
  let list = [...store.studyRecords];
  if (filters?.courseId) list = list.filter(s => s.courseId === filters.courseId);
  if (filters?.rangerId) list = list.filter(s => s.rangerId === filters.rangerId);
  return list
    .map(s => {
      const r = store.rangers.find(x => x.id === s.rangerId);
      const c = store.courses.find(x => x.id === s.courseId);
      return { ...s, rangerName: r?.name, courseTitle: c?.title };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 培训完成率统计
export function studyStats() {
  const totalRangers = store.rangers.filter(r => r.status === 1).length;
  const finishedUnits = store.studyRecords.filter(s => s.progress >= 100).length;
  return {
    totalCourses: store.courses.filter(c => c.status === 1).length,
    totalStudyUnits: store.studyRecords.length,
    finishedUnits,
    completionRate: store.studyRecords.length
      ? Math.round((finishedUnits / store.studyRecords.length) * 1000) / 10
      : 0,
    totalRangers,
  };
}