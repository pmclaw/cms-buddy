/**
 * 手机外壳展示页：把移动端（./mobile.html）嵌在模拟机身里。
 * 尺寸按 iPhone 18 Pro 比例取值：402 × 889（与设计稿截图 1280 × 2832 同比）。
 */
const SCREEN_WIDTH = 402
const SCREEN_HEIGHT = 889

export default function PhoneShowcase() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#e9ebf1] p-8">
      <div className="relative rounded-[58px] bg-[#0e1118] p-[12px] shadow-[0_40px_90px_rgba(20,24,45,0.35)]">
        <div
          className="relative overflow-hidden rounded-[46px] bg-white"
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        >
          <iframe
            title="小招Buddy 移动端"
            src="./mobile.html"
            className="h-full w-full border-0"
          />
          {/* 灵动岛 */}
          <div className="pointer-events-none absolute top-[10px] left-1/2 h-[26px] w-[118px] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>

      <p className="text-sub text-[12px]">
        小招Buddy 移动端 · iPhone 18 Pro 预览（{SCREEN_WIDTH} × {SCREEN_HEIGHT}）
      </p>
    </div>
  )
}
