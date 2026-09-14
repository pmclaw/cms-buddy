import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from 'cn'

function RadioGroup(
  props: React.ComponentProps<typeof RadioGroupPrimitive.Root>
) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" {...props} />
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'size-[15px] shrink-0 cursor-pointer rounded-full border border-[#c9c9d6] bg-white outline-none data-[state=checked]:border-[5px] data-[state=checked]:border-brand',
        className
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
