import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import { AuthProvider, useAuth } from "./utils/authContext.jsx";
import { setToastFunction } from "./services/api.js";
import ExpertAdvice from "./pages/ExpertAdvice.jsx";

function AppContent() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.900");
  const navbarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Set up toast function for API service
  useEffect(() => {
    setToastFunction(toast);
  }, [toast]);

  return (
    <Router>
      <Box minH="100vh" bg={bg}>
        {/* Navigation Bar */}
        <Box
          bg={navbarBg}
          borderBottom="1px"
          borderColor={borderColor}
          position="sticky"
          top="0"
          zIndex="1000"
          boxShadow="sm"
        >
          <Container maxW="container.xl">
            <Flex h="16" alignItems="center" justifyContent="space-between">
              <Heading size="lg" color="brand.500" fontWeight="bold">
                <Link href="/" _hover={{ textDecoration: "none" }}>
                  Nivesh Assist
                </Link>
              </Heading>

              {user && (
                <HStack spacing={8}>
                  <Link
                    href="/dashboard"
                    color="gray.600"
                    _hover={{ color: "brand.500" }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/insights"
                    color="gray.600"
                    _hover={{ color: "brand.500" }}
                  >
                    AI Insights
                  </Link>
                  <Link
                    href="/advice"
                    color="gray.600"
                    _hover={{ color: "brand.500" }}
                  >
                    Expert Advice
                  </Link>
                  <Link
                    onClick={logout}
                    color="red.500"
                    cursor="pointer"
                    _hover={{ color: "red.600" }}
                  >
                    Logout
                  </Link>
                </HStack>
              )}
            </Flex>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxW="container.xl" py={8}>
          <Routes>
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/insights"
              element={user ? <AIInsights /> : <Navigate to="/login" />}
            />
            <Route
              path="/advice"
              element={user ? <ExpertAdvice /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
