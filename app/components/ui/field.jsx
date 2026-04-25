import * as React from "react"
import { cn } from "~/lib/utils"

export function Field({ className, children }) {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

export function FieldLabel({ className, children, ...props }) {
  return (
    <label 
      className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1", className)} 
      {...props}
    >
      {children}
    </label>
  )
}
