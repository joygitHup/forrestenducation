import { toast } from 'sonner';

type ToastId = string | number;

export const notify = {
  success(message: string, id?: ToastId) {
    return toast.success(message, id !== undefined ? { id } : undefined);
  },
  warning(message: string, id?: ToastId) {
    return toast.warning(message, id !== undefined ? { id } : undefined);
  },
  error(err: unknown, fallback = '操作失败', id?: ToastId) {
    const fromString = typeof err === 'string' && err.trim() ? err : '';
    const fromError = err instanceof Error && err.message ? err.message : '';
    const message = fromString || fromError || fallback;
    return toast.error(message, id !== undefined ? { id } : undefined);
  },
  loading(message: string) {
    return toast.loading(message);
  },
};

export const MSG = {
  created: '创建成功',
  updated: '更新成功',
  deleted: '删除成功',
  saved: '保存成功',
  handled: '处理成功',
  done: '操作成功',
} as const;
