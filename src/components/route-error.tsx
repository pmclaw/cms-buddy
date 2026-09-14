import { Link, useRouteError } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** 路由级错误边界：渲染抛错时兜底，避免整个应用白屏。 */
export default function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String(error)

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>页面出错了</CardTitle>
          <CardDescription>渲染这个页面时抛出了异常。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <pre className="w-full overflow-x-auto rounded-md bg-muted p-3 text-muted-foreground text-xs">
            {message}
          </pre>
          <Button asChild variant="outline">
            <Link to="/">返回首页</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
