from app.calculator import calculate_emissions
import pytest

def test_calculate_emissions_kg_to_kg():
    # 100 kg * 2.5 kgCO2e/kg = 250
    result = calculate_emissions("Steel", 100, "kg", 2.5, "kgCO2e/kg")
    assert result["co2e"] == 250.0
    assert result["base_unit"] == "kg"
    assert result["converted_quantity"] == 100

def test_calculate_emissions_ton_to_kg():
    # 1 US Ton (907.185 kg) * 2.5 = 2267.9625
    result = calculate_emissions("Steel", 1, "ton", 2.5, "kgCO2e/kg")
    assert result["co2e"] == 2267.9625
    assert result["base_unit"] == "kg"
    assert result["converted_quantity"] == 907.185

def test_invalid_unit_conversion():
    with pytest.raises(ValueError):
        calculate_emissions("Steel", 100, "gallon", 2.5, "kgCO2e/kg")
