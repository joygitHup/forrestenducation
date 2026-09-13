'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import type { Course, StudyListData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BookOpen, ClipboardCheck, Users } from 'lucide-react';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';

function buildStudyQuery(keyword: string, courseId: string, finished: string) {
  const q = new URLSearchParams();
  if (keyword.trim()) q.set('keyword', keyword.trim());
  if (courseId !== 'all') q.set('courseId', courseId);
  if (finished !== 'all') q.set('finished', finished);
  const qs = q.toString();
  return qs ? `/api/study?${qs}` : '/api/study';
}

export default function StudyPage() {
  const [keyword, setKeyword] = useState('');
  const [courseId, setCourseId] = useState('all');
  const [finished, setFinished] = useState('all');
  const { data, loading } = useApi<{ success: boolean; data: StudyListData }>(
    buildStudyQuery(keyword, courseId, finished),
  );
  const courses = useApi<{ success: boolean; data: Course[] }>('/api/course');

  const stats = data?.data.stats;
  const records = data?.data.records ?? [];
  const courseOptions = courses.data?.data ?? [];

  return (
    <div className="p-6">
      <PageHeader title="学习记录" description="护林员培训学习情况" />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<BookOpen className="h-5 w-5" />} label="在架课程" value={String(stats?.totalCourses ?? '-')} />
        <Stat icon={<ClipboardCheck className="h-5 w-5" />} label="学习总人次" value={String(stats?.totalStudyUnits ?? '-')} />
        <Stat icon={<Users className="h-5 w-5" />} label="已完成人次" value={String(stats?.finishedUnits ?? '-')} />
        <Stat icon={<ClipboardCheck className="h-5 w-5" />} label="完成率" value={`${stats?.completionRate ?? '-'}%`} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索护林员/课程"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-52"><SelectValue placeholder="课程" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部课程</SelectItem>
            {courseOptions.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={finished} onValueChange={setFinished}>
          <SelectTrigger className="w-32"><SelectValue placeholder="完成状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部进度</SelectItem>
            <SelectItem value="1">已完成</SelectItem>
            <SelectItem value="0">进行中</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无学习记录"
        columns={[
          { key: 'rangerName', label: '护林员', render: r => <span className="font-medium">{r.rangerName ?? '-'}</span> },
          { key: 'courseTitle', label: '课程' },
          { key: 'progress', label: '进度', render: r => <ProgressBadge progress={r.progress} /> },
          { key: 'finishTime', label: '完成时间', render: r => r.finishTime ? new Date(r.finishTime).toLocaleDateString() : '-' },
          { key: 'createdAt', label: '加入时间', render: r => <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span> },
        ]}
        rows={records}
      />
    </div>
  );
}

function ProgressBadge({ progress }: { progress: number }) {
  if (progress >= 100) return <Badge className="bg-green-600">已完成</Badge>;
  return <Badge variant="secondary">{progress}%</Badge>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="text-xl font-semibold tabular-nums">{value}</div></div>
    </CardContent></Card>
  );
}
