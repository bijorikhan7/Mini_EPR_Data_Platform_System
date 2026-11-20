import clsx from 'clsx'
import type { FormHTMLAttributes, ReactNode } from 'react'

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={clsx('space-y-4', className)} noValidate {...props}>
      {children}
    </form>
  )
}
