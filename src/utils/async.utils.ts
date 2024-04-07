export class CancellationToken {
  canceled = false;
}

export async function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runWithTimeout <TResult>(action: (token: CancellationToken) => Promise<TResult>, timeoutMs: number): Promise<TResult> {
  const token = new CancellationToken()
  const timer = setTimeout(() => {
    token.canceled = true
  }, timeoutMs)

  try {
    return await action(token)
  } finally {
    clearTimeout(timer)
  }
}
