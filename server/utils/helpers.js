// server/utils/helpers.js
const Shipment = require('../models/Shipment');
const crypto = require('crypto');

/**
 * Calculate CBM (Cubic Meter) from dimensions
 * @param {string} dimensions - Format: "length x width x height" in cm
 * @returns {number} CBM value
 */
const calculateCBM = (dimensions) => {
  try {
    if (!dimensions || typeof dimensions !== 'string') {
      return 0;
    }

    // Parse dimensions (expected format: "100 x 50 x 30" or "100x50x30")
    const dimensionParts = dimensions
      .toLowerCase()
      .replace(/\s/g, '') // Remove spaces
      .split('x')
      .map(dim => parseFloat(dim.trim()));

    if (dimensionParts.length !== 3 || dimensionParts.some(isNaN)) {
      throw new Error('Invalid dimensions format');
    }

    const [length, width, height] = dimensionParts;

    // Convert from cm to meters and calculate CBM
    const cbm = (length / 100) * (width / 100) * (height / 100);
    
    return parseFloat(cbm.toFixed(6));
  } catch (error) {
    console.error('Error calculating CBM:', error);
    return 0;
  }
};

/**
 * Convert CBM to different units
 * @param {number} cbm - CBM value
 * @param {string} unit - Target unit (cubic_inches, cubic_feet, liters)
 * @returns {number} Converted value
 */
const convertCBM = (cbm, unit) => {
  const conversions = {
    cubic_inches: cbm * 61023.7,
    cubic_feet: cbm * 35.3147,
    liters: cbm * 1000,
    cubic_meters: cbm
  };

  return conversions[unit] || cbm;
};

/**
 * Calculate dimensional weight
 * @param {string} dimensions - Dimensions string
 * @param {number} divisor - Dimensional weight divisor (default: 5000 for air freight)
 * @returns {number} Dimensional weight in kg
 */
const calculateDimensionalWeight = (dimensions, divisor = 5000) => {
  try {
    const dimensionParts = dimensions
      .toLowerCase()
      .replace(/\s/g, '')
      .split('x')
      .map(dim => parseFloat(dim.trim()));

    if (dimensionParts.length !== 3 || dimensionParts.some(isNaN)) {
      return 0;
    }

    const [length, width, height] = dimensionParts;
    
    // Calculate dimensional weight (L x W x H in cm / divisor)
    const dimensionalWeight = (length * width * height) / divisor;
    
    return parseFloat(dimensionalWeight.toFixed(2));
  } catch (error) {
    console.error('Error calculating dimensional weight:', error);
    return 0;
  }
};

/**
 * Determine chargeable weight (higher of actual weight vs dimensional weight)
 * @param {number} actualWeight - Actual weight in kg
 * @param {string} dimensions - Dimensions string
 * @param {number} divisor - Dimensional weight divisor
 * @returns {object} Weight comparison object
 */
const getChargeableWeight = (actualWeight, dimensions, divisor = 5000) => {
  const dimensionalWeight = calculateDimensionalWeight(dimensions, divisor);
  const chargeableWeight = Math.max(actualWeight, dimensionalWeight);
  
  return {
    actualWeight: parseFloat(actualWeight),
    dimensionalWeight,
    chargeableWeight,
    isDimensional: chargeableWeight === dimensionalWeight
  };
};

/**
 * Generate unique tracking number
 * @returns {Promise<string>} Unique tracking number
 */
const generateTrackingNumber = async () => {
  let trackingNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate tracking number format: WW + 8 digits + check digit
    const randomBytes = crypto.randomBytes(4);
    const numbers = randomBytes.readUInt32BE(0).toString().padStart(8, '0').slice(0, 8);
    
    // Calculate check digit using Luhn algorithm
    const checkDigit = calculateLuhnCheckDigit('WW' + numbers);
    trackingNumber = `WW${numbers}${checkDigit}`;

    // Check if tracking number already exists
    const existingShipment = await Shipment.findOne({ 
      where: { trackingNumber } 
    });
    
    isUnique = !existingShipment;
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique tracking number');
  }

  return trackingNumber;
};

/**
 * Calculate Luhn check digit for tracking number validation
 * @param {string} number - Number string to calculate check digit for
 * @returns {number} Check digit
 */
const calculateLuhnCheckDigit = (number) => {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  let sum = 0;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if ((digits.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
  }

  return (10 - (sum % 10)) % 10;
};

/**
 * Validate tracking number format and check digit
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} Is valid tracking number
 */
const validateTrackingNumber = (trackingNumber) => {
  if (!trackingNumber || trackingNumber.length !== 11) {
    return false;
  }

  if (!trackingNumber.startsWith('WW')) {
    return false;
  }

  const numberPart = trackingNumber.slice(0, -1);
  const checkDigit = parseInt(trackingNumber.slice(-1));
  const calculatedCheckDigit = calculateLuhnCheckDigit(numberPart);

  return checkDigit === calculatedCheckDigit;
};

/**
 * Format weight for display
 * @param {number} weight - Weight in kg
 * @param {string} unit - Display unit (kg, lbs, g)
 * @returns {string} Formatted weight string
 */
const formatWeight = (weight, unit = 'kg') => {
  if (!weight || isNaN(weight)) return '0 kg';

  const conversions = {
    kg: weight,
    lbs: weight * 2.20462,
    g: weight * 1000
  };

  const convertedWeight = conversions[unit] || weight;
  const decimals = unit === 'g' ? 0 : 2;

  return `${convertedWeight.toFixed(decimals)} ${unit}`;
};

/**
 * Format dimensions for display
 * @param {string} dimensions - Dimensions string
 * @param {string} unit - Display unit (cm, in, m)
 * @returns {string} Formatted dimensions string
 */
const formatDimensions = (dimensions, unit = 'cm') => {
  try {
    if (!dimensions) return 'N/A';

    const dimensionParts = dimensions
      .toLowerCase()
      .replace(/\s/g, '')
      .split('x')
      .map(dim => parseFloat(dim.trim()));

    if (dimensionParts.length !== 3 || dimensionParts.some(isNaN)) {
      return dimensions; // Return original if parsing fails
    }

    let [length, width, height] = dimensionParts;

    // Convert from cm to target unit
    const conversions = {
      cm: 1,
      in: 0.393701,
      m: 0.01,
      mm: 10
    };

    const factor = conversions[unit] || 1;
    length = (length * factor).toFixed(unit === 'mm' ? 0 : 2);
    width = (width * factor).toFixed(unit === 'mm' ? 0 : 2);
    height = (height * factor).toFixed(unit === 'mm' ? 0 : 2);

    return `${length} x ${width} x ${height} ${unit}`;
  } catch (error) {
    return dimensions || 'N/A';
  }
};

/**
 * Calculate shipping cost estimate based on weight, CBM, and service type
 * @param {object} params - Shipping parameters
 * @returns {object} Cost breakdown
 */
const calculateShippingCost = ({
  weight,
  cbm,
  serviceType = 'standard',
  origin,
  destination,
  declaredValue = 0
}) => {
  // Base rates per kg and per CBM (these would come from your pricing database)
  const baseRates = {
    standard: { perKg: 5.50, perCBM: 150.00 },
    express: { perKg: 8.50, perCBM: 220.00 },
    economy: { perKg: 3.50, perCBM: 100.00 }
  };

  const rates = baseRates[serviceType] || baseRates.standard;

  // Calculate weight-based and volume-based costs
  const weightCost = weight * rates.perKg;
  const volumeCost = cbm * rates.perCBM;

  // Use higher of weight-based or volume-based cost
  const transportCost = Math.max(weightCost, volumeCost);

  // Additional fees
  const fuelSurcharge = transportCost * 0.15; // 15% fuel surcharge
  const securityFee = 25.00; // Flat security fee
  const documentationFee = 15.00; // Documentation fee

  // Insurance (0.5% of declared value, minimum $10)
  const insurance = Math.max(declaredValue * 0.005, 10.00);

  const subtotal = transportCost + fuelSurcharge + securityFee + documentationFee + insurance;
  const tax = subtotal * 0.16; // 16% VAT (adjust for your region)
  const total = subtotal + tax;

  return {
    breakdown: {
      transportCost: parseFloat(transportCost.toFixed(2)),
      fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
      securityFee: securityFee,
      documentationFee: documentationFee,
      insurance: parseFloat(insurance.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    },
    currency: 'USD',
    serviceType,
    basedOn: weightCost > volumeCost ? 'weight' : 'volume'
  };
};

/**
 * Generate invoice number
 * @returns {string} Invoice number
 */
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `INV${year}${month}${day}${random}`;
};

/**
 * Generate waybill number
 * @returns {string} Waybill number
 */
const generateWaybillNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  
  return `AWB${year}${month}${random}`;
};

/**
 * Parse and validate dimensions input
 * @param {string} input - User input for dimensions
 * @returns {object} Parsed dimensions with validation
 */
const parseDimensions = (input) => {
  const result = {
    isValid: false,
    dimensions: null,
    length: 0,
    width: 0,
    height: 0,
    cbm: 0,
    error: null
  };

  try {
    if (!input || typeof input !== 'string') {
      result.error = 'Dimensions input is required';
      return result;
    }

    // Clean and parse input
    const cleaned = input.toLowerCase().replace(/[^\d.x\s]/g, '');
    const parts = cleaned.split(/[x×*]/);

    if (parts.length !== 3) {
      result.error = 'Dimensions must be in format: length x width x height';
      return result;
    }

    const [length, width, height] = parts.map(part => {
      const num = parseFloat(part.trim());
      return isNaN(num) ? 0 : num;
    });

    if (length <= 0 || width <= 0 || height <= 0) {
      result.error = 'All dimensions must be greater than 0';
      return result;
    }

    // Check maximum dimensions (adjust limits as needed)
    const maxDimension = 300; // 300 cm max per dimension
    if (length > maxDimension || width > maxDimension || height > maxDimension) {
      result.error = `Maximum dimension allowed is ${maxDimension} cm`;
      return result;
    }

    result.isValid = true;
    result.length = length;
    result.width = width;
    result.height = height;
    result.dimensions = `${length} x ${width} x ${height}`;
    result.cbm = calculateCBM(result.dimensions);

  } catch (error) {
    result.error = 'Invalid dimensions format';
  }

  return result;
};

module.exports = {
  calculateCBM,
  convertCBM,
  calculateDimensionalWeight,
  getChargeableWeight,
  generateTrackingNumber,
  validateTrackingNumber,
  formatWeight,
  formatDimensions,
  calculateShippingCost,
  generateInvoiceNumber,
  generateWaybillNumber,
  parseDimensions
};