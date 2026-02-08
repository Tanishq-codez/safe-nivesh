import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Link,
  useColorModeValue,
  Divider,
  Spinner,
  Flex,
  useToast
} from '@chakra-ui/react'
import { useAuth } from '../utils/authContext.jsx'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    monthlyIncome: '',
    investmentHorizon: '',
    riskAppetite: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const inputBg = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const showToast = (title, description, status = 'error') => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Form submission - isLogin:', isLogin, 'email:', formData.email)
      
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        })
        showToast('Login Successful', 'Welcome back to FundLens!', 'success')
      } else {
        await register(formData)
        showToast('Registration Successful', 'Welcome to FundLens!', 'success')
      }
      
      console.log('Authentication successful, navigating to dashboard')
      navigate('/dashboard')
    } catch (err) {
      console.error('Form submission error:', err)
      console.error('Full error object:', err)
      console.error('Error response data:', err.response?.data)
      
      // Handle specific error cases with toast notifications
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        
        if (status === 400) {
          const message = data.message || 'Please check your input and try again'
          setError(message)
          showToast('Validation Error', message, 'error')
        } else if (status === 401) {
          const message = data.message || 'Invalid email or password'
          setError(message)
          showToast('Authentication Failed', message, 'error')
        } else if (status === 409) {
          const message = data.message || 'User already exists'
          setError(message)
          showToast('Registration Failed', message, 'warning')
        } else if (status === 423) {
          const message = data.message || 'Account locked'
          setError(message)
          showToast('Account Locked', message, 'warning')
        } else if (status === 500) {
          const message = data.message || 'Server error. Please try again later.'
          setError(message)
          showToast('Server Error', message, 'error')
        } else if (status === 503) {
          const message = data.message || 'Service unavailable. Please try again later.'
          setError(message)
          showToast('Service Unavailable', message, 'error')
        } else {
          const message = data.message || `Error (${status}): Please try again`
          setError(message)
          showToast('Error', message, 'error')
        }
      } else if (err.request) {
        const message = 'Network error. Please check your connection and try again.'
        setError(message)
        showToast('Network Error', message, 'error')
      } else {
        const message = 'An unexpected error occurred. Please try again.'
        setError(message)
        showToast('Unexpected Error', message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="xl" color="brand.500" mb={2}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Heading>
          <Text color={textColor}>
            {isLogin 
              ? 'Sign in to access your FundLens dashboard' 
              : 'Start your investment journey with FundLens'
            }
          </Text>
        </Box>

        <Card w="full" maxW="md" bg={cardBg} border="1px" borderColor={borderColor} boxShadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  {!isLogin && (
                    <>
                      <FormControl isRequired>
                        <FormLabel color={textColor}>Full Name</FormLabel>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          bg={inputBg}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color={textColor}>Age</FormLabel>
                        <Input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          min="18"
                          max="100"
                          bg={inputBg}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color={textColor}>Monthly Income Range</FormLabel>
                        <Select
                          name="monthlyIncome"
                          value={formData.monthlyIncome}
                          onChange={handleChange}
                          bg={inputBg}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        >
                          <option value="">Select Income Range</option>
                          <option value="0-400000">₹0 - ₹400,000</option>
                          <option value="400001-800000">₹400,001 - ₹8,00,000</option>
                          <option value="800001-1200000">₹8,00,001 - ₹12,00,000</option>
                          <option value="1200001-1600000">₹12,00,001 - ₹16,00,000</option>
                          <option value="1600001-2000000">₹16,00,001 - ₹20,00,000</option>
                          <option value="2000001-2400000">₹20,00,001 - ₹24,00,000</option>
                          <option value="2400000+">₹24,00,000+</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color={textColor}>Investment Horizon</FormLabel>
                        <Select
                          name="investmentHorizon"
                          value={formData.investmentHorizon}
                          onChange={handleChange}
                          bg={inputBg}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        >
                          <option value="">Select Horizon</option>
                          <option value="short">Short Term (&lt; 3 years)</option>
                          <option value="medium">Medium Term (3-7 years)</option>
                          <option value="long">Long Term (&gt; 7 years)</option>
                        </Select>
                      </FormControl>

                      {/* <FormControl isRequired>
                        <FormLabel color={textColor}>Risk Appetite</FormLabel>
                        <Select
                          name="riskAppetite"
                          value={formData.riskAppetite}
                          onChange={handleChange}
                          bg={inputBg}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        >
                          <option value="">Select Risk Level</option>
                          <option value="low">Low Risk</option>
                          <option value="moderate">Moderate Risk</option>
                          <option value="high">High Risk</option>
                        </Select>
                      </FormControl> */}

                      <Divider />
                    </>
                  )}

                  <FormControl isRequired>
                    <FormLabel color={textColor}>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      bg={inputBg}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={textColor}>Password</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      bg={inputBg}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Processing..."
                  >
                    {isLogin ? 'Login' : 'Create Account'}
                  </Button>
                </VStack>
              </form>

              <Divider />

              <Text textAlign="center" color={textColor}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  colorScheme="brand"
                  ml={2}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Register' : 'Login'}
                </Button>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Login