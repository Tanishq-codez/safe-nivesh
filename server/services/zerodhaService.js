const mockFundData = {
  'Axis Bluechip Fund': [
    { company: 'Reliance Industries', sector: 'Energy', weight: 8.2 },
    { company: 'HDFC Bank', sector: 'Banking', weight: 7.8 },
    { company: 'Infosys', sector: 'IT', weight: 6.5 },
    { company: 'ICICI Bank', sector: 'Banking', weight: 5.9 },
    { company: 'TCS', sector: 'IT', weight: 5.4 },
    { company: 'Bharti Airtel', sector: 'Telecom', weight: 4.8 },
    { company: 'HUL', sector: 'FMCG', weight: 4.2 },
    { company: 'ITC', sector: 'FMCG', weight: 3.9 },
    { company: 'Larsen & Toubro', sector: 'Engineering', weight: 3.5 },
    { company: 'Kotak Bank', sector: 'Banking', weight: 3.2 }
  ],
  'HDFC Mid-Cap Opportunities': [
    { company: 'Avenue Supermarts', sector: 'Retail', weight: 6.8 },
    { company: 'PI Industries', sector: 'Agro Chemicals', weight: 5.9 },
    { company: 'Coforge', sector: 'IT', weight: 5.4 },
    { company: 'Tata Consumer', sector: 'FMCG', weight: 5.1 },
    { company: 'Jubilant FoodWorks', sector: 'Food Service', weight: 4.8 },
    { company: 'Muthoot Finance', sector: 'NBFC', weight: 4.5 },
    { company: 'Cholamandalam Investment', sector: 'Finance', weight: 4.2 },
    { company: 'Tata Elxsi', sector: 'IT', weight: 3.9 },
    { company: 'Godrej Consumer', sector: 'FMCG', weight: 3.6 },
    { company: 'Aubank', sector: 'NBFC', weight: 3.3 }
  ],
  'SBI Small Cap Fund': [
    { company: 'Solar Industries', sector: 'Defense', weight: 5.2 },
    { company: 'Fine Organic', sector: 'Chemicals', weight: 4.8 },
    { company: 'Capri Global', sector: 'NBFC', weight: 4.5 },
    { company: 'Ratnamani Metals', sector: 'Metals', weight: 4.2 },
    { company: 'Kirloskar Oil Engines', sector: 'Engineering', weight: 3.9 },
    { company: 'Shakti Pumps', sector: 'Industrial', weight: 3.6 },
    { company: 'Vardhman Textiles', sector: 'Textiles', weight: 3.3 },
    { company: 'Time Technoplast', sector: 'Packaging', weight: 3.0 },
    { company: 'Jindal Steel', sector: 'Steel', weight: 2.8 },
    { company: 'Apar Industries', sector: 'Energy', weight: 2.5 }
  ],
  'Mirae Asset Large Cap Fund': [
    { company: 'Reliance Industries', sector: 'Energy', weight: 9.1 },
    { company: 'TCS', sector: 'IT', weight: 8.3 },
    { company: 'HDFC Bank', sector: 'Banking', weight: 7.8 },
    { company: 'Infosys', sector: 'IT', weight: 6.9 },
    { company: 'ICICI Bank', sector: 'Banking', weight: 6.2 },
    { company: 'HUL', sector: 'FMCG', weight: 5.4 },
    { company: 'Bharti Airtel', sector: 'Telecom', weight: 4.8 },
    { company: 'Kotak Bank', sector: 'Banking', weight: 4.1 },
    { company: 'ITC', sector: 'FMCG', weight: 3.7 },
    { company: 'Larsen & Toubro', sector: 'Engineering', weight: 3.3 }
  ],
  'Parag Parikh Flexi Cap Fund': [
    { company: 'HDFC Bank', sector: 'Banking', weight: 8.5 },
    { company: 'Reliance Industries', sector: 'Energy', weight: 7.2 },
    { company: 'Infosys', sector: 'IT', weight: 6.8 },
    { company: 'TCS', sector: 'IT', weight: 5.9 },
    { company: 'ICICI Bank', sector: 'Banking', weight: 5.3 },
    { company: 'HUL', sector: 'FMCG', weight: 4.8 },
    { company: 'Bharti Airtel', sector: 'Telecom', weight: 4.2 },
    { company: 'Kotak Bank', sector: 'Banking', weight: 3.7 },
    { company: 'ITC', sector: 'FMCG', weight: 3.4 },
    { company: 'Larsen & Toubro', sector: 'Engineering', weight: 3.0 }
  ]
}

const getFundHoldings = async (fundName) => {
  if (process.env.KITE_API_KEY && process.env.KITE_ACCESS_TOKEN) {
    try {
      console.log('Fetching real data from Zerodha Kite API...')
      return await fetchFromKiteAPI(fundName)
    } catch (error) {
      console.log('Kite API failed, using mock data:', error.message)
    }
  }
  
  console.log('Using mock data for fund:', fundName)
  return mockFundData[fundName] || generateRandomHoldings(fundName)
}

const fetchFromKiteAPI = async (fundName) => {
  const axios = require('axios')
  
  try {
    const response = await axios.get(`https://kite.zerodha.com/oms/instruments/${fundName}`, {
      headers: {
        'X-KITE-APIKEY': process.env.KITE_API_KEY,
        'Authorization': `token ${process.env.KITE_API_KEY}:${process.env.KITE_ACCESS_TOKEN}`
      }
    })
    
    return response.data.holdings || []
  } catch (error) {
    throw new Error('Failed to fetch data from Kite API')
  }
}

const generateRandomHoldings = (fundName) => {
  const sectors = ['Banking', 'IT', 'Energy', 'FMCG', 'Telecom', 'Engineering', 'Pharma', 'Chemicals']
  const companies = {
    'Banking': ['HDFC Bank', 'ICICI Bank', 'Kotak Bank', 'SBI', 'Axis Bank'],
    'IT': ['TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra'],
    'Energy': ['Reliance Industries', 'ONGC', 'NTPC', 'Power Grid', 'Coal India'],
    'FMCG': ['HUL', 'ITC', 'Godrej Consumer', 'Dabur', 'Marico'],
    'Telecom': ['Bharti Airtel', 'Reliance Jio', 'Vodafone Idea'],
    'Engineering': ['Larsen & Toubro', 'BHEL', 'Siemens', 'ABB'],
    'Pharma': ['Sun Pharma', 'Dr Reddy', 'Cipla', 'Lupin', 'Biocon'],
    'Chemicals': ['UPL', 'PI Industries', 'Deepak Nitrite', 'Aarti Industries']
  }
  
  const holdings = []
  let remainingWeight = 100
  
  sectors.forEach((sector, index) => {
    if (remainingWeight <= 0) return
    
    const sectorCompanies = companies[sector] || []
    const numCompanies = Math.min(Math.floor(Math.random() * 3) + 1, sectorCompanies.length)
    
    for (let i = 0; i < numCompanies && remainingWeight > 0; i++) {
      const weight = Math.min(Math.random() * 10 + 2, remainingWeight)
      const company = sectorCompanies[Math.floor(Math.random() * sectorCompanies.length)]
      
      holdings.push({
        company,
        sector,
        weight: parseFloat(weight.toFixed(2))
      })
      
      remainingWeight -= weight
    }
  })
  
  return holdings.slice(0, 10)
}

module.exports = {
  getFundHoldings
}