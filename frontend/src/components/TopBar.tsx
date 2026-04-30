import { Database, RefreshCw } from 'lucide-react'
import { Box, Flex, HStack, styled } from 'styled-system/jsx'
import { Button } from '~/components/ui/button'

type Props = {
  apiUp: boolean
  seeding: boolean
  onSeed: () => void
}

export function TopBar({ apiUp, seeding, onSeed }: Props) {
  return (
    <Flex
      align="center"
      justify="space-between"
      px="6"
      py="3"
      bg="bg.default"
      borderBottom="1px solid"
      borderColor="border.default"
      flexShrink="0"
    >
      <styled.div fontSize="md" fontWeight="medium">
        Travel Hub <styled.span color="fg.muted" fontWeight="normal">— Console de démo</styled.span>
      </styled.div>

      <HStack gap="3">
        <HStack
          gap="2"
          px="3"
          py="1.5"
          borderRadius="full"
          bg={apiUp ? 'green.a3' : 'red.a3'}
          fontSize="xs"
          fontWeight="medium"
          color={apiUp ? 'green.text' : 'red.text'}
        >
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={apiUp ? 'green.default' : 'red.default'}
          />
          {apiUp ? 'API connectée' : 'API hors-ligne'}
        </HStack>

        <Button
          variant="outline"
          size="sm"
          onClick={onSeed}
          loading={seeding}
        >
          <RefreshCw size={14} />
          Re-seed MongoDB
        </Button>

        <Box
          width="32px"
          height="32px"
          borderRadius="full"
          bg="colorPalette.a4"
          color="colorPalette.text"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
        >
          <Database size={14} />
        </Box>
      </HStack>
    </Flex>
  )
}
