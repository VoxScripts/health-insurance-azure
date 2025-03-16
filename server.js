const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration (UPDATE THIS WITH YOUR STATIC SITE URL)
app.use(cors({
  origin: 'https://healthriskui-v2.z1.web.core.windows.net'
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Health Risk API v2 is running!');
});

// Helper functions
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(2);
}

function getBMICategory(bmi) {
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function getBloodPressureCategory(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return 'normal';
  if (systolic < 130 && diastolic < 80) return 'elevated';
  if (systolic < 140 || diastolic < 90) return 'stage 1';
  if (systolic < 180 || diastolic < 120) return 'stage 2';
  return 'crisis';
}

function calculateRisk(age, bmiCategory, bpCategory, familyHistory) {
  let points = 0;

  // Age points
  if (age < 30) points += 0;
  else if (age < 45) points += 10;
  else if (age < 60) points += 20;
  else points += 30;

  // BMI points
  if (bmiCategory === 'overweight') points += 30;
  else if (bmiCategory === 'obese') points += 75;

  // Blood pressure points
  if (bpCategory === 'elevated') points += 15;
  else if (bpCategory === 'stage 1') points += 30;
  else if (bpCategory === 'stage 2') points += 75;
  else if (bpCategory === 'crisis') points += 100;

  // Family history points
  if (familyHistory.includes('diabetes')) points += 10;
  if (familyHistory.includes('cancer')) points += 10;
  if (familyHistory.includes('alzheimer')) points += 10;

  return points;
}

function getRiskCategory(points) {
  if (points <= 20) return 'low risk';
  if (points <= 50) return 'moderate risk';
  if (points <= 75) return 'high risk';
  return 'uninsurable';
}

// API Endpoint
app.post('/api/calculate-risk', (req, res) => {
  const { age, weightKg, heightCm, systolic, diastolic, familyHistory } = req.body;

  if (heightCm < 60) {
    return res.status(400).json({ error: 'Height must be at least 60 cm.' });
  }

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const bpCategory = getBloodPressureCategory(systolic, diastolic);
  const riskPoints = calculateRisk(age, bmiCategory, bpCategory, familyHistory);
  const riskCategory = getRiskCategory(riskPoints);

  res.json({
    bmi,
    bmiCategory,
    bpCategory,
    riskPoints,
    riskCategory
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
