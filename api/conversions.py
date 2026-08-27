# Hardcoded conversion dictionary
# Format: {(from_unit, to_unit): multiplier}
CONVERSIONS = {
    # Mass
    ("lbs", "kg"): 0.453592,
    ("lb", "kg"): 0.453592,
    ("ton", "kg"): 907.185, # US Short Ton
    ("tonne", "kg"): 1000.0, # Metric Tonne
    ("g", "kg"): 0.001,
    ("kg", "lbs"): 2.20462,
    ("kg", "ton"): 0.00110231,
    ("kg", "tonne"): 0.001,
    
    # Distance
    ("mile", "km"): 1.60934,
    ("miles", "km"): 1.60934,
    ("m", "km"): 0.001,
    ("km", "mile"): 0.621371,
    
    # Volume
    ("gallon", "liter"): 3.78541,
    ("gal", "liter"): 3.78541,
    ("liter", "gallon"): 0.264172,
    
    # Energy / Electricity
    ("mwh", "kwh"): 1000.0,
    ("wh", "kwh"): 0.001,
    ("kwh", "mwh"): 0.001,
    ("kwh", "wh"): 1000.0,
    
    # Logistics (Ton-Miles)
    ("ton-mile", "ton-km"): 1.45997,
    ("ton-km", "ton-mile"): 0.684945,
    ("ton-miles", "ton-km"): 1.45997,
    ("ton-kms", "ton-mile"): 0.684945,
}

def convert_to_base_unit(quantity: float, from_unit: str, to_unit: str) -> float:
    """
    Converts a quantity from one unit to another using a hardcoded dictionary.
    """
    from_unit = from_unit.strip().lower()
    to_unit = to_unit.strip().lower()
    
    if from_unit == to_unit:
        return quantity
        
    conversion_key = (from_unit, to_unit)
    
    if conversion_key in CONVERSIONS:
        return quantity * CONVERSIONS[conversion_key]
        
    # If direct conversion not found, try to see if it's an unrecognized unit 
    # but we should strictly fail to prevent AI hallucinations or bad data.
    raise ValueError(f"Conversion from '{from_unit}' to '{to_unit}' is not supported.")
