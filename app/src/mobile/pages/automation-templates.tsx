import { useNavigate } from 'react-router'

import { PhoneScreen, ScreenHeader } from '@/components/screen'
import { templates } from '@/data/tasks'

export function AutomationTemplatesPage() {
  const navigate = useNavigate()

  return (
    <PhoneScreen>
      <ScreenHeader back showMenu={false} title="从模板添加" />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => navigate(`/automation/new?template=${template.id}`)}
              className="flex flex-col gap-2 rounded-[14px] bg-white px-3.5 py-3.5 text-left ring-1 ring-[rgba(0,0,0,0.04)] active:bg-[#fafbfd]"
            >
              <span className="text-ink text-[15px] leading-[22px] font-medium">
                {template.name}
              </span>
              <span className="text-ink/60 line-clamp-3 text-[12px] leading-[19px]">
                {template.desc}
              </span>
              <span className="text-sub text-right text-[11px]">
                🔥 {template.uses}
              </span>
            </button>
          ))}
        </div>
      </div>
    </PhoneScreen>
  )
}
