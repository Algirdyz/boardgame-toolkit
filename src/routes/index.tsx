import { Flex, Image } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <Flex direction="column" align="center" justify="center" h="100%">
      <Image
        src="/logo.png"
        alt="Your App Logo"
      />
      Design your Board game!
    </Flex>
  )
}