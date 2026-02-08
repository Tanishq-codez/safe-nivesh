import { useState } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Button,
  Stack,
  Avatar,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaGoogle, FaPhone, FaEnvelope, FaCalendar } from "react-icons/fa";

const ExpertAdvice = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const consultants = [
    {
      id: 1,
      name: "Rajesh Kumar",
      specialization: "Equity Funds",
      experience: "12+ years",
      email: "rajesh.kumar@niveshassist.com",
      phone: "+91 98765 43210",
      availability: "Mon–Fri, 10 AM – 5 PM",
    },
    {
      id: 2,
      name: "Priya Sharma",
      specialization: "Debt & Fixed Income",
      experience: "10+ years",
      email: "priya.sharma@niveshassist.com",
      phone: "+91 98765 43211",
      availability: "Tue–Thu, 2 PM – 6 PM",
    },
    {
      id: 3,
      name: "Amit Patel",
      specialization: "Hybrid Funds",
      experience: "8+ years",
      email: "amit.patel@niveshassist.com",
      phone: "+91 98765 43212",
      availability: "Mon–Wed–Fri, 9 AM – 4 PM",
    },
    {
      id: 4,
      name: "Deepika Singh",
      specialization: "Sector Focused Funds",
      experience: "9+ years",
      email: "deepika.singh@niveshassist.com",
      phone: "+91 98765 43213",
      availability: "Mon–Sat, 11 AM – 7 PM",
    },
    {
      id: 5,
      name: "Vikram Desai",
      specialization: "International Funds",
      experience: "11+ years",
      email: "vikram.desai@niveshassist.com",
      phone: "+91 98765 43214",
      availability: "Daily, 8 AM – 8 PM",
    },
    {
      id: 6,
      name: "Neha Gupta",
      specialization: "Retirement Planning",
      experience: "7+ years",
      email: "neha.gupta@niveshassist.com",
      phone: "+91 98765 43215",
      availability: "Tue–Sat, 10 AM – 6 PM",
    },
    {
      id: 7,
      name: "Sanjay Verma",
      specialization: "Growth Funds",
      experience: "13+ years",
      email: "sanjay.verma@niveshassist.com",
      phone: "+91 98765 43216",
      availability: "Mon–Fri, 9 AM – 3 PM",
    },
    {
      id: 8,
      name: "Ananya Chatterjee",
      specialization: "Tax Planning",
      experience: "9+ years",
      email: "ananya.chatterjee@niveshassist.com",
      phone: "+91 98765 43217",
      availability: "Wed–Sun, 2 PM – 8 PM",
    },
    {
      id: 9,
      name: "Rohan Khanna",
      specialization: "Emerging Market Funds",
      experience: "10+ years",
      email: "rohan.khanna@niveshassist.com",
      phone: "+91 98765 43218",
      availability: "Mon–Thu, 11 AM – 5 PM",
    },
    {
      id: 10,
      name: "Shreya Mishra",
      specialization: "Balanced Portfolio",
      experience: "8+ years",
      email: "shreya.mishra@niveshassist.com",
      phone: "+91 98765 43219",
      availability: "Tue–Fri–Sun, 10 AM – 7 PM",
    },
  ];

  const handleScheduleMeet = (consultant) => {
    setSelectedConsultant(consultant);
    setFormData({ name: "", email: "", date: "", time: "" });
    onOpen();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!Object.values(formData).every(Boolean)) {
      toast({
        title: "Incomplete form",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    window.open("https://meet.google.com/new", "_blank");

    toast({
      title: "Meeting Scheduled",
      description: `Meeting with ${selectedConsultant.name}`,
      status: "success",
      duration: 3000,
    });

    onClose();
  };

  return (
    <Container maxW="6xl" py={10}>
      <Stack spacing={6} textAlign="center">
        <Heading>Expert Financial Advisors</Heading>
        <Text color="gray.600">
          Book a 1-on-1 session with experienced mutual fund professionals
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={10}>
        {consultants.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <HStack spacing={4}>
                <Avatar name={c.name} />
                <Stack spacing={0}>
                  <Heading size="sm">{c.name}</Heading>
                  <Badge colorScheme="purple">{c.experience}</Badge>
                </Stack>
              </HStack>
            </CardHeader>

            <CardBody>
              <Stack spacing={3}>
                <Badge width="fit-content">{c.specialization}</Badge>

                <Divider />

                <HStack>
                  <Icon as={FaEnvelope} />
                  <Text fontSize="sm">{c.email}</Text>
                </HStack>

                <HStack>
                  <Icon as={FaPhone} />
                  <Text fontSize="sm">{c.phone}</Text>
                </HStack>

                <HStack>
                  <Icon as={FaCalendar} />
                  <Text fontSize="sm">{c.availability}</Text>
                </HStack>

                <Button
                  leftIcon={<FaGoogle />}
                  colorScheme="purple"
                  onClick={() => handleScheduleMeet(c)}
                >
                  Schedule Meet
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule with {selectedConsultant?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Time</FormLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                >
                  <option value="10 AM">10 AM</option>
                  <option value="11 AM">11 AM</option>
                  <option value="2 PM">2 PM</option>
                  <option value="4 PM">4 PM</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              leftIcon={<FaGoogle />}
              onClick={handleSubmit}
            >
              Start Meet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ExpertAdvice;
