# LedgerZero API Contracts & Schemas

This document defines the strict JSON schemas required for inter-service communication between the Frontend, the n8n Pipeline, the AI Extraction Service, and the FastAPI Calculation Engine.

## 1. AI Extraction Response Schema
When n8n sends raw OCR text to the AI Service (LLM), the AI **must** return a JSON array in the following format. This prevents hallucinations and ensures our calculation engine can parse the data.

```json
[
  {
    "item": "String. The exact name or description of the carbon-emitting item/activity (e.g., 'Steel', 'Delivery Truck').",
    "quantity": "Float. The numeric amount. If freight/logistics, multiply the weight by distance to output ton-miles. If no physical metrics exist, output the total cost in USD.",
    "unit": "String. The unit of measurement (e.g., 'kg', 'ton', 'miles', 'ton-mile', 'usd')."
  }
]
```

## 2. FastAPI Calculation Request Schema
When the n8n pipeline triggers the Python Calculation Engine, it must send a `POST` request to `/calculate` with the following JSON body.

```json
{
  "item": "Steel",
  "quantity": 100,
  "unit": "kg",
  "emission_factor": 2.5,
  "emission_factor_unit": "kgCO2e/kg"
}
```

## 3. FastAPI Calculation Response Schema
The Python engine will respond with the calculated CO2e value and the unit conversions that took place.

```json
{
  "item": "Steel",
  "original_quantity": 100,
  "original_unit": "kg",
  "converted_quantity": 100,
  "base_unit": "kg",
  "co2e": 250.0,
  "message": "Calculation successful"
}
```
