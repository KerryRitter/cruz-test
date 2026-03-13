import {
  Box,
  Button,
  Code,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";

const features = [
  {
    icon: "📝",
    title: "Notes",
    desc: "Create, edit, and organize your notes. Built with tRPC, Drizzle ORM, and Cloudflare D1.",
  },
  {
    icon: "🔐",
    title: "Authentication",
    desc: "Secure login and registration with session management, invite codes, and email verification.",
  },
  {
    icon: "🏢",
    title: "Organizations",
    desc: "Multi-tenant org management with role-based permissions and member invitation flows.",
  },
  {
    icon: "⚡",
    title: "Edge-Native",
    desc: "Runs on Cloudflare Pages with D1, KV, Workers AI, and Queues — zero cold starts.",
  },
  {
    icon: "🎨",
    title: "Great UI",
    desc: "Chakra UI + Tailwind CSS with pre-built layouts, forms, data tables, and modals.",
  },
  {
    icon: "🧩",
    title: "Feature Modules",
    desc: "Modular architecture — each feature registers its own DI container, router, and routes.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="#030712">
      {/* Nav */}
      <Flex
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={50}
        px={6}
        py={3}
        align="center"
        justify="space-between"
        bg="rgba(3, 7, 18, 0.8)"
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Text fontSize="xl" fontWeight="bold" color="white" fontFamily="mono">
          Cruz
          <Text as="span" color="#818cf8">
            Test
          </Text>
        </Text>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="ghost"
            color="gray.400"
            _hover={{ color: "white" }}
            onClick={() => navigate("/auth/login")}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            bg="#4F46E5"
            color="white"
            _hover={{ bg: "#4338CA" }}
            onClick={() => navigate("/auth/register")}
          >
            Get Started
          </Button>
        </HStack>
      </Flex>

      {/* Hero */}
      <Container
        maxW="5xl"
        pt={{ base: 32, md: 44 }}
        pb={{ base: 16, md: 24 }}
        textAlign="center"
      >
        <VStack spacing={6}>
          <HStack
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            rounded="full"
            px={4}
            py={1}
            fontSize="sm"
            color="gray.400"
          >
            <Text>Built with CruzJS on Cloudflare</Text>
          </HStack>

          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="800"
            color="white"
            lineHeight="1.1"
            letterSpacing="-0.02em"
          >
            Your notes,{" "}
            <Text
              as="span"
              bgGradient="linear(to-r, #818cf8, #6366f1, #a78bfa)"
              bgClip="text"
            >
              everywhere
            </Text>
          </Heading>

          <Text fontSize={{ base: "lg", md: "xl" }} color="gray.400" maxW="2xl">
            A full-stack demo app built with CruzJS — featuring authentication,
            organizations, and a notes feature, all running on Cloudflare's edge
            network.
          </Text>

          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              bg="#4F46E5"
              color="white"
              _hover={{ bg: "#4338CA" }}
              onClick={() => navigate("/auth/register")}
            >
              Start for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              color="gray.300"
              borderColor="whiteAlpha.300"
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={() => navigate("/auth/login")}
            >
              Sign In
            </Button>
          </HStack>

          <Box pt={2}>
            <Code
              bg="whiteAlpha.100"
              color="#818cf8"
              px={4}
              py={2}
              rounded="lg"
              fontSize="sm"
              fontFamily="mono"
            >
              npx create-cruz-app my-app
            </Code>
          </Box>
        </VStack>
      </Container>

      {/* Features */}
      <Box id="features" py={{ base: 16, md: 24 }}>
        <Container maxW="5xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              color="white"
              fontWeight="700"
            >
              Everything included
            </Heading>
            <Text fontSize="lg" color="gray.400" maxW="xl">
              This demo showcases a complete CruzJS app — from auth to data to
              deployment.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {features.map((f) => (
              <Box
                key={f.title}
                p={6}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.100"
                rounded="xl"
                _hover={{ borderColor: "whiteAlpha.200", bg: "whiteAlpha.100" }}
                transition="all 0.2s"
              >
                <Text fontSize="2xl" mb={3}>
                  {f.icon}
                </Text>
                <Text fontWeight="600" color="white" mb={2}>
                  {f.title}
                </Text>
                <Text fontSize="sm" color="gray.400" lineHeight="1.6">
                  {f.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="3xl" textAlign="center">
          <VStack spacing={6}>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              color="white"
              fontWeight="700"
            >
              Ready to try it?
            </Heading>
            <Text fontSize="lg" color="gray.400" maxW="md">
              Create an account and start taking notes in under a minute.
            </Text>
            <Button
              size="lg"
              bg="#4F46E5"
              color="white"
              _hover={{ bg: "#4338CA" }}
              onClick={() => navigate("/auth/register")}
            >
              Get Started Free
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.100" py={8}>
        <Container maxW="5xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text color="gray.500" fontSize="sm">
              Cruz Test — A CruzJS demo app
            </Text>
            <Text color="gray.600" fontSize="xs">
              Built with CruzJS
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
