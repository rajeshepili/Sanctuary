import { toast } from 'sonner'

type ToastMessages<T> = {
  loading: string
  success: string | ((data: T) => string)
  error: string
}

type ToastOptions = {
  onError?: (err: unknown) => void
}

export async function toastAsync<T>(
  promiseFactory: () => Promise<T>,
  messages: ToastMessages<T>,
  options?: ToastOptions,
): Promise<T> {
  const promise = promiseFactory()

  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  })

  try {
    const res = await promise
    return res
  } catch (err) {
    options?.onError?.(err)
    throw err
  }
}
