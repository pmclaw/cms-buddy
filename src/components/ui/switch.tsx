import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from 'cn'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none data-[state=checked]:bg-ink data-[state=unchecked]:bg-[#d3d6de] focus-visible:ring-3 focus-visible:ring-ring/50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(40,50,83,0.2)] transition-transform data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
