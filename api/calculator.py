from conversions import convert_to_base_unit

def calculate_emissions(item: str, quantity: float, unit: str, factor: float, factor_unit: str) -> dict:
    """
    Core deterministic calculation logic for Carbon Emissions.
    Formula: CO2e = Activity Data * Emission Factor
    
    This is the ONLY place where hardcoded mathematical logic resides.
    """
    
    # 1. Parse the factor_unit to determine what base unit it expects.
    # E.g., if factor_unit is 'kgCO2e/kg', the base unit is 'kg'.
    # If factor_unit is 'kgCO2e/ton', the base unit is 'ton'.
    parts = factor_unit.split('/')
    if len(parts) != 2:
        raise ValueError(f"Invalid emission factor unit format: {factor_unit}. Expected format like 'kgCO2e/kg'")
    
    expected_base_unit = parts[1].strip().lower()
    
    # 2. Convert the input quantity to the expected base unit
    converted_qty = convert_to_base_unit(quantity, unit.lower(), expected_base_unit)
    
    # 3. Deterministic Multiplication
    co2e = converted_qty * factor
    
    return {
        "item": item,
        "original_quantity": quantity,
        "original_unit": unit,
        "converted_quantity": converted_qty,
        "base_unit": expected_base_unit,
        "co2e": round(co2e, 4)
    }
