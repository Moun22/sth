import type { ReactNode } from 'react'
import { Stack, styled } from 'styled-system/jsx'

type Props = {
  title: string
  description?: ReactNode
}

export function PageHeader({ title, description }: Props) {
  return (
    <Stack gap="1">
      <styled.h1 fontSize="xl" fontWeight="semibold" color="fg.default">
        {title}
      </styled.h1>
      {description && (
        <styled.p fontSize="sm" color="fg.muted">
          {description}
        </styled.p>
      )}
    </Stack>
  )
}
