export function LoadingView({ text = 'Loading...' }: { text?: string }) {
  return <p className="muted">{text}</p>
}

export function ErrorView({
  message = 'Something went wrong',
}: {
  message?: string
}) {
  return <p className="error-text">{message}</p>
}

