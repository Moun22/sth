import type { ReactNode } from 'react'
import { Stack, styled } from 'styled-system/jsx'
import { TechBadgeRow, type Tech } from '~/components/TechBadge'

type Props = {
  title: string
  description?: ReactNode
  techs?: { tech: Tech; suffix?: string }[]
}

export function PageHeader({ title, description, techs }: Props) {
  return (
    <Stack gap="2">
      <styled.h1 fontSize="xl" fontWeight="semibold" color="fg.default">
        {title}
      </styled.h1>
      {techs && techs.length > 0 && <TechBadgeRow items={techs} />}
      {description && (
        <styled.p fontSize="sm" color="fg.muted">
          {description}
        </styled.p>
      )}
    </Stack>
  )
}
