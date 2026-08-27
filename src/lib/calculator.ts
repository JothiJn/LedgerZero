// Conversions dictionary — ported from Python backend
const CONVERSIONS: Record<string, number> = {
  'lbs->kg': 0.453592, 'lb->kg': 0.453592,
  'ton->kg': 907.185, 'tonne->kg': 1000.0,
  'g->kg': 0.001, 'kg->lbs': 2.20462,
  'kg->ton': 0.00110231, 'kg->tonne': 0.001,
  'mile->km': 1.60934, 'miles->km': 1.60934,
  'm->km': 0.001, 'km->mile': 0.621371,
  'gallon->liter': 3.78541, 'gal->liter': 3.78541,
  'liter->gallon': 0.264172,
  'mwh->kwh': 1000.0, 'wh->kwh': 0.001,
  'kwh->mwh': 0.001, 'kwh->wh': 1000.0,
  'ton-mile->ton-km': 1.45997, 'ton-km->ton-mile': 0.684945,
  'ton-miles->ton-km': 1.45997, 'ton-kms->ton-mile': 0.684945,
};

function convertToBaseUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const from = fromUnit.trim().toLowerCase();
  const to = toUnit.trim().toLowerCase();
  if (from === to) return quantity;
  const key = `${from}->${to}`;
  if (key in CONVERSIONS) return quantity * CONVERSIONS[key];
  throw new Error(`Conversion from '${from}' to '${to}' is not supported.`);
}

export function calculateEmissions(
  item: string, quantity: number, unit: string,
  factor: number, factorUnit: string
): { item: string; co2e: number } {
  const parts = factorUnit.split('/');
  if (parts.length !== 2) throw new Error(`Invalid factor unit: ${factorUnit}`);
  const expectedBase = parts[1].trim().toLowerCase();
  const converted = convertToBaseUnit(quantity, unit.toLowerCase(), expectedBase);
  const co2e = Math.round(converted * factor * 10000) / 10000;
  return { item, co2e };
}
