/** 轻量 className 合并（移动端不引入额外依赖） */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
