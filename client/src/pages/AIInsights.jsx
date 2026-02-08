import { useState, useEffect } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Select,
  Input,
  Spinner,
  Divider,
  Badge,
  Progress,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from "@chakra-ui/react"
import { CheckCircleIcon, WarningIcon, InfoIcon } from "@chakra-ui/icons"
import api from "../services/api"

const AIInsights = () => {
  const [userType, setUserType] = useState(null)
  const [answers, setAnswers] = useState({
    hasInsurance: "",
    hasEmergencyFund: "",
    monthlyInvestment: "",
    riskAppetite: "",
    investmentHorizon: ""
  })

  const [portfolioData, setPortfolioData] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const warningBg = useColorModeValue("red.50", "red.900")
  const successBg = useColorModeValue("green.50", "green.900")
  const infoBg = useColorModeValue("blue.50", "blue.900")

  /* ============================
     FETCH PORTFOLIO (EXISTING USER)
     ============================ */
  useEffect(() => {
    if (userType === "existing") {
      setLoading(true)
      api
        .get("/portfolio/analyze")
        .then((res) => {
          setPortfolioData(res.data)
          setError("")
        })
        .catch((err) => {
          setPortfolioData(null)
          setError("Failed to fetch portfolio data. Please try again.")
        })
        .finally(() => setLoading(false))
    }
  }, [userType])

  /* ============================
     ANALYZE PORTFOLIO
     ============================ */
  const analyzePortfolio = async () => {
    setLoading(true)
    setError("")
    setAnalysisResult(null)
    setInsights(null)

    try {
      // Get AI insights with analysis
      // Backend will fetch funds and perform detailed analysis automatically
      const aiRes = await api.post("/ai/insights", {
        userType: "existing"
      }, {
        timeout: 20000
      })

      console.log("AI Insights:", aiRes.data)
      setInsights(aiRes.data)
    } catch (err) {
      console.error("Error:", err)
      setError(
        err?.response?.data?.message ||
        "Unable to analyze portfolio. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  /* ============================
     GENERATE NEW INVESTOR INSIGHTS
     ============================ */
  const generateNewInvestorInsights = async () => {
    setLoading(true)
    setError("")
    setInsights(null)

    try {
      const res = await api.post("/ai/insights", {
        userType: "new",
        answers
      }, {
        timeout: 20000
      })

      setInsights(res.data)
    } catch (err) {
      console.error("AI Insights error:", err)
      setError(
        err?.response?.data?.message ||
        "Unable to generate insights. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  /* ============================
     VALIDATION
     ============================ */
  const isNewUserReady =
    answers.hasInsurance &&
    answers.hasEmergencyFund &&
    answers.monthlyInvestment &&
    answers.riskAppetite &&
    answers.investmentHorizon

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">

        {/* ERROR MESSAGE */}
        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
        )}

        {/* ============================
            STEP 1 – USER TYPE
           ============================ */}
        {!userType && (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Heading size="lg">Mutual Fund Analyzer</Heading>
                <Text fontSize="lg" color="gray.600">
                  Do you already invest in mutual funds?
                </Text>
                <HStack justify="center" spacing={4}>
                  <Button
                    size="lg"
                    colorScheme="blue"
                    onClick={() => setUserType("existing")}
                  >
                    Yes, Analyze My Portfolio
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setUserType("new")}
                  >
                    No, I'm New to Investing
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* ============================
            NEW INVESTOR FORM
           ============================ */}
        {userType === "new" && !insights && (
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <Heading size="md">Let's Build Your Investment Foundation</Heading>
                <Divider />

                <Select
                  placeholder="Do you have insurance?"
                  value={answers.hasInsurance}
                  onChange={(e) =>
                    setAnswers({ ...answers, hasInsurance: e.target.value })
                  }
                  size="lg"
                >
                  <option value="Yes, I have both Health and Life Insurance">Both Health and Life Insurance</option>
                  <option value="Yes, I have Health Insurance">Health Insurance Only</option>
                  <option value="Yes, I have Life Insurance">Life Insurance Only</option>
                  <option value="no">None</option>
                </Select>

                <Select
                  placeholder="Do you have an emergency fund (6 months expenses)?"
                  value={answers.hasEmergencyFund}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      hasEmergencyFund: e.target.value
                    })
                  }
                  size="lg"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>

                <Input
                  type="number"
                  placeholder="Monthly investment amount (₹)"
                  value={answers.monthlyInvestment}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      monthlyInvestment: e.target.value
                    })
                  }
                  size="lg"
                />

                <Select
                  placeholder="Risk appetite"
                  value={answers.riskAppetite}
                  onChange={(e) =>
                    setAnswers({ ...answers, riskAppetite: e.target.value })
                  }
                  size="lg"
                >
                  <option value="low">Low - I prefer stable returns</option>
                  <option value="moderate">Moderate - Balance of growth and stability</option>
                  <option value="high">High - I can handle volatility for growth</option>
                </Select>

                <Select
                  placeholder="Investment horizon"
                  value={answers.investmentHorizon}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      investmentHorizon: e.target.value
                    })
                  }
                  size="lg"
                >
                  <option value="short-term">Short term (1-3 years)</option>
                  <option value="medium-term">Medium term (3-7 years)</option>
                  <option value="long-term">Long term (7+ years)</option>
                </Select>

                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={generateNewInvestorInsights}
                  isDisabled={!isNewUserReady || loading}
                  width="full"
                >
                  {loading ? <Spinner size="sm" mr={2} /> : null}
                  Get AI-Powered Guidance
                </Button>

                {!isNewUserReady && (
                  <Text fontSize="sm" color="gray.500">
                    Please fill all fields to receive personalized investment guidance.
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* ============================
            EXISTING INVESTOR CTA
           ============================ */}
        {userType === "existing" && !analysisResult && !insights && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Portfolio Analysis</Heading>
                <Divider />
                <Text>
                  Get detailed insights on:
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Sector-wise concentration and risk
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Company-level overlaps reducing diversification
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Impact analysis (30% in one sector = 20% portfolio loss if sector drops)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    AI-powered recommendations for improvement
                  </ListItem>
                </List>

                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={analyzePortfolio}
                  isDisabled={!portfolioData || loading}
                  width="full"
                >
                  {loading ? <Spinner size="sm" mr={2} /> : null}
                  Analyze My Portfolio
                </Button>

                {!portfolioData && loading && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Fetching your portfolio data…
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* ============================
            LOADING
           ============================ */}
        {loading && !analysisResult && !insights && (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Analyzing your portfolio and generating insights...</Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* ============================
            EXISTING USER ANALYSIS RESULTS
           ============================ */}
        {userType === "existing" && analysisResult && (
          <PortfolioAnalysisDisplay analysis={analysisResult} />
        )}

        {/* ============================
            AI INSIGHTS - EXISTING USER
           ============================ */}
        {userType === "existing" && insights && (
          <ExistingUserInsights insights={insights} />
        )}

        {/* ============================
            AI INSIGHTS - NEW USER
           ============================ */}
        {userType === "new" && insights && (
          <NewUserInsights insights={insights} />
        )}
      </VStack>
    </Container>
  )
}

/* ============================
   PORTFOLIO ANALYSIS DISPLAY
   ============================ */
const PortfolioAnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null

  const { summary, sectorAnalysis, companyAnalysis, warnings } = analysis

  return (
    <VStack spacing={6} align="stretch">
      {/* SUMMARY CARDS */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <StatCard
          label="Total Investment"
          value={`₹${(summary.totalInvestment / 100000).toFixed(2)}L`}
          color="blue"
        />
        <StatCard
          label="Funds"
          value={summary.fundCount}
          color="purple"
        />
        <StatCard
          label="Diversification Score"
          value={`${summary.diversificationScore}%`}
          color={summary.diversificationScore > 70 ? "green" : summary.diversificationScore > 50 ? "orange" : "red"}
        />
        <StatCard
          label="Risk Level"
          value={summary.riskLevel}
          color="red"
        />
      </SimpleGrid>

      {/* WARNINGS */}
      {warnings && warnings.length > 0 && (
        <Card borderColor="red.300" borderLeftWidth={4}>
          <CardHeader>
            <Heading size="md" color="red.600">
              ⚠️ Risk Alerts ({warnings.length})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {warnings.map((warning, idx) => (
                <WarningCard key={idx} warning={warning} />
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* SECTOR ANALYSIS */}
      {sectorAnalysis && (
        <Card>
          <CardHeader>
            <Heading size="md">Sector-wise Distribution</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {sectorAnalysis.exposure?.map((sector, idx) => (
                <SectorBar key={idx} sector={sector} />
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* COMPANY ANALYSIS */}
      {companyAnalysis?.topHoldings && (
        <Card>
          <CardHeader>
            <Heading size="md">Top 10 Holdings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {companyAnalysis.topHoldings.map((holding, idx) => (
                <HStack key={idx} justify="space-between" borderBottomWidth={1} pb={2}>
                  <Text fontWeight="medium">{holding.name}</Text>
                  <Badge colorScheme={holding.percentage > 10 ? "red" : "green"}>
                    {holding.percentage}%
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}

/* ============================
   WARNING CARD
   ============================ */
const WarningCard = ({ warning }) => {
  const severityColor = {
    critical: "red",
    high: "orange",
    medium: "yellow",
    low: "blue"
  }[warning.severity] || "gray"

  return (
    <Box
      borderLeftWidth={4}
      borderLeftColor={`${severityColor}.500`}
      pl={4}
      py={3}
      bg={`${severityColor}.50`}
      rounded="md"
    >
      <Text fontWeight="bold" color={`${severityColor}.700`} mb={2}>
        {warning.title}
      </Text>
      <Text fontSize="sm" mb={3}>
        {warning.message}
      </Text>
      {warning.actionItems && (
        <VStack spacing={1} align="stretch">
          {warning.actionItems.map((item, idx) => (
            <Text key={idx} fontSize="xs" color="gray.700">
              • {item}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  )
}

/* ============================
   SECTOR BAR
   ============================ */
const SectorBar = ({ sector }) => {
  const getColor = (value) => {
    if (value > 40) return "red"
    if (value > 30) return "orange"
    if (value > 20) return "yellow"
    return "green"
  }

  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Text fontWeight="medium" fontSize="sm">{sector.name}</Text>
        <Text fontSize="sm" fontWeight="bold" color={`${getColor(sector.value)}.600`}>
          {sector.value}%
        </Text>
      </HStack>
      <Progress
        value={sector.value}
        colorScheme={getColor(sector.value)}
        size="sm"
        rounded="full"
      />
    </Box>
  )
}

/* ============================
   STAT CARD
   ============================ */
const StatCard = ({ label, value, color }) => (
  <Card bg={`${color}.50`} borderColor={`${color}.200`} borderWidth={1}>
    <CardBody>
      <Text fontSize="xs" color="gray.600" textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={`${color}.700`} mt={2}>
        {value}
      </Text>
    </CardBody>
  </Card>
)

/* ============================
   EXISTING USER INSIGHTS
   ============================ */
const ExistingUserInsights = ({ insights }) => (
  <VStack spacing={6} align="stretch">
    {/* Portfolio Health */}
    <Card borderTopWidth={4} borderTopColor="blue.500">
      <CardHeader>
        <Heading size="md">📊 Portfolio Health Summary</Heading>
      </CardHeader>
      <CardBody>
        <Text>{insights.portfolioHealth}</Text>
      </CardBody>
    </Card>

    {/* Overlapping Holdings */}
    {insights.overlappingHoldings && (
      <Card borderTopWidth={4} borderTopColor="red.500">
        <CardHeader>
          <Heading size="md">🔴 Overlapping Holdings (Concentration Risk)</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>{insights.overlappingHoldings}</Text>
          {/* Detailed table if available */}
          {insights.overlappingSharesDetail && insights.overlappingSharesDetail.length > 0 && (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Company</Th>
                    <Th isNumeric>No. of Funds</Th>
                    <Th>Funds</Th>
                    <Th isNumeric>Total Exposure %</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {insights.overlappingSharesDetail.map((share, idx) => (
                    <Tr key={idx}>
                      <Td fontWeight="bold">{share.company}</Td>
                      <Td isNumeric><Badge colorScheme="red">{share.numberOfFunds}</Badge></Td>
                      <Td fontSize="sm">{share.funds.join(", ")}</Td>
                      <Td isNumeric fontWeight="bold">{share.totalExposurePercent}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    )}

    {/* Overlapping Sectors */}
    {insights.sectorCongestion && (
      <Card borderTopWidth={4} borderTopColor="orange.500">
        <CardHeader>
          <Heading size="md">🏢 Sector Concentration Risk</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>{insights.sectorCongestion}</Text>
          {/* Detailed sector table if available */}
          {insights.overlappingSectorsDetail && insights.overlappingSectorsDetail.length > 0 && (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Sector</Th>
                    <Th isNumeric>No. of Funds</Th>
                    <Th>Funds</Th>
                    <Th isNumeric>Total Exposure %</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {insights.overlappingSectorsDetail.map((sector, idx) => (
                    <Tr key={idx}>
                      <Td fontWeight="bold">{sector.sector}</Td>
                      <Td isNumeric><Badge colorScheme="orange">{sector.numberOfFunds}</Badge></Td>
                      <Td fontSize="sm">{sector.funds.join(", ")}</Td>
                      <Td isNumeric fontWeight="bold">{sector.totalExposurePercent}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    )}

    {/* Diversification Assessment */}
    {insights.diversificationAssessment && (
      <Card borderTopWidth={4} borderTopColor="purple.500">
        <CardHeader>
          <Heading size="md">📈 Diversification Score & Assessment</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text>{insights.diversificationAssessment}</Text>
            {/* Score visualization if available */}
            {insights.diversificationScoreDetail && (
              <Box>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Overall Score</Text>
                    <HStack>
                      <Box>
                        <Progress 
                          value={insights.diversificationScoreDetail.overall} 
                          size="lg" 
                          colorScheme="purple"
                          width="200px"
                        />
                      </Box>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {insights.diversificationScoreDetail.overall}/100
                      </Text>
                    </HStack>
                  </Box>
                  <Box bg="purple.50" p={3} rounded="md">
                    <Text fontSize="sm" color="gray.600">Level</Text>
                    <Badge 
                      colorScheme={
                        insights.diversificationScoreDetail.overall >= 80 ? "green" :
                        insights.diversificationScoreDetail.overall >= 60 ? "blue" :
                        insights.diversificationScoreDetail.overall >= 40 ? "orange" : "red"
                      }
                      fontSize="md"
                      p={2}
                    >
                      {insights.diversificationScoreDetail.level}
                    </Badge>
                  </Box>
                </SimpleGrid>
                {insights.diversificationScoreDetail.sectorDiversity && (
                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Score Breakdown:</Text>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Sector Diversity</Text>
                        <Text fontSize="sm" fontWeight="bold">{insights.diversificationScoreDetail.sectorDiversity}/30</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Share Diversity</Text>
                        <Text fontSize="sm" fontWeight="bold">{insights.diversificationScoreDetail.shareDiversity}/40</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Concentration Score</Text>
                        <Text fontSize="sm" fontWeight="bold">{insights.diversificationScoreDetail.concentrationScore}/30</Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    )}

    {/* Risk Warnings */}
    {insights.riskWarnings && insights.riskWarnings.length > 0 && (
      <Card borderTopWidth={4} borderTopColor="red.500">
        <CardHeader>
          <Heading size="md">⚠️ Risk Warnings</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {insights.riskWarnings.map((warning, idx) => (
              <Box key={idx} borderLeftWidth={4} borderLeftColor="red.500" pl={4} py={2}>
                <Text fontWeight="bold" color="red.700">{warning.title}</Text>
                <Text fontSize="sm" mt={1}>{warning.message}</Text>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    )}

    {/* Potential Sectors to Invest In */}
    {insights.potentialSectors && insights.potentialSectors.length > 0 && (
      <Card borderTopWidth={4} borderTopColor="green.500">
        <CardHeader>
          <Heading size="md">✨ Potential Sectors to Add (Build Diversification)</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {insights.potentialSectors.map((sector, idx) => (
              <Box key={idx} p={3} bg="green.50" rounded="md" borderLeftWidth={3} borderLeftColor="green.500">
                <Heading size="sm" color="green.700">{sector.sector}</Heading>
                <Text fontSize="sm" mt={1} color="gray.700">{sector.reason}</Text>
                {sector.expectedCharacteristics && sector.expectedCharacteristics.length > 0 && (
                  <HStack mt={2} spacing={1} flexWrap="wrap">
                    {sector.expectedCharacteristics.map((char, cidx) => (
                      <Badge key={cidx} colorScheme="green" variant="outline" fontSize="xs">
                        {char}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    )}

    {/* Fund Recommendations */}
    {insights.fundRecommendations && (
      <Card borderTopWidth={4} borderTopColor="cyan.500">
        <CardHeader>
          <Heading size="md">🎯 Fund Recommendations for Diversification</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>{insights.fundRecommendations}</Text>
          {insights.fundRecommendationsDetail && insights.fundRecommendationsDetail.length > 0 && (
            <VStack spacing={4} align="stretch">
              {insights.fundRecommendationsDetail.map((rec, idx) => (
                <Box key={idx} p={4} bg="cyan.50" rounded="md" border="1px" borderColor="cyan.200">
                  <Heading size="sm" color="cyan.700" mb={2}>{rec.sector}</Heading>
                  <Text fontSize="sm" mb={2}><strong>Recommendation:</strong> {rec.recommendation}</Text>
                  <Text fontSize="sm" mb={2}><strong>Rationale:</strong> {rec.rationale}</Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="cyan">{rec.fundType}</Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
    )}

    {/* Suggested Adjustments */}
    {insights.suggestedAdjustments && (
      <Card borderTopWidth={4} borderTopColor="blue.500">
        <CardHeader>
          <Heading size="md">📝 Suggested Adjustments & Action Plan</Heading>
        </CardHeader>
        <CardBody>
          <Text>{insights.suggestedAdjustments}</Text>
        </CardBody>
      </Card>
    )}

    {/* Risk Alignment */}
    {insights.riskAlignment && (
      <Card borderTopWidth={4} borderTopColor="blue.500">
        <CardHeader>
          <Heading size="md">🎯 Risk Profile Alignment</Heading>
        </CardHeader>
        <CardBody>
          <Text>{insights.riskAlignment}</Text>
        </CardBody>
      </Card>
    )}

    {/* Disclaimer */}
    <Alert status="info" borderRadius="md">
      <AlertIcon />
      <Box>
        <Text fontWeight="bold" mb={2}>📋 Disclaimer</Text>
        <Text fontSize="sm">
          This analysis is powered by Google Gemini AI and is for educational purposes only. It is not financial advice. Please consult with a qualified financial advisor before making investment decisions.
        </Text>
      </Box>
    </Alert>
  </VStack>
)

/* ============================
   NEW USER INSIGHTS
   ============================ */
const NewUserInsights = ({ insights }) => (
  <VStack spacing={6} align="stretch">
    <Card borderTopWidth={4} borderTopColor="green.500">
      <CardHeader>
        <Heading size="md">Financial Readiness Assessment</Heading>
      </CardHeader>
      <CardBody>
        <Text>{insights.financialReadiness}</Text>
      </CardBody>
    </Card>

    {insights.priorityChecklist && (
      <Card>
        <CardHeader>
          <Heading size="md">✓ Priority Checklist</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            {insights.priorityChecklist?.map((item, idx) => (
              <HStack key={idx}>
                <CheckCircleIcon color="green.500" />
                <Text>{item}</Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    )}

    {insights.investmentGuidance && (
      <Card borderTopWidth={4} borderTopColor="blue.500">
        <CardHeader>
          <Heading size="md">🎯 Investment Guidance</Heading>
        </CardHeader>
        <CardBody>
          <Text>{insights.investmentGuidance}</Text>
        </CardBody>
      </Card>
    )}

    {insights.nextSteps && (
      <Card borderTopWidth={4} borderTopColor="purple.500">
        <CardHeader>
          <Heading size="md">📋 Next Steps</Heading>
        </CardHeader>
        <CardBody>
          <Text>{insights.nextSteps}</Text>
        </CardBody>
      </Card>
    )}
  </VStack>
)

/* ============================
   SCENARIO BOX
   ============================ */
const ScenarioBox = ({ scenario, status }) => (
  <Card borderTopWidth={4} borderTopColor={`${status}.500`}>
    <CardBody>
      <Text fontWeight="bold" fontSize="sm" mb={2}>
        {scenario.description}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={`${status}.600`} mb={2}>
        {scenario.impact}
      </Text>
      <Text fontSize="xs" color="gray.600">
        <strong>Mitigation:</strong> {scenario.mitigation}
      </Text>
    </CardBody>
  </Card>
)

export default AIInsights