import os
import json
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.calculator import calculate_emissions

# Supabase
from supabase import create_client, Client

# AI
import google.generativeai as genai
from groq import Groq

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LedgerZero Calculation Engine", version="2.0.0")

# Fix: Allow Cross-Origin requests from the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Initialize AI Clients
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class WebhookPayload(BaseModel):
    invoice_id: str = Field(..., description="The UUID of the invoice in Supabase")
    file_url: str = Field(..., description="The public URL of the uploaded invoice image")

def process_invoice(invoice_id: str, file_url: str):
    # Initialize Supabase inside the thread
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # 1. Update status to Processing
        supabase.table("invoices").update({"status": "Processing"}).eq("id", invoice_id).execute()

        # 2. Download Image
        response = requests.get(file_url, timeout=15)
        response.raise_for_status()
        image_data = response.content

        # 3. AI Extraction (Primary: Gemini)
        extracted_data = None
        try:
            model = genai.GenerativeModel("gemini-1.5-pro")
            prompt = "Extract the item, quantity, and unit from this invoice. Return ONLY the JSON schema defined in api_contracts.md. If this is a freight/shipping invoice with weight and distance, multiply the weight by the distance and return the result as 'ton-mile' or 'ton-km'. If there are no physical metrics, use the total cost as a fallback (unit: 'usd')."
            
            contents = [
                prompt,
                {"mime_type": "image/jpeg", "data": image_data}
            ]
            response = model.generate_content(contents)
            text_response = response.text
            
            # Clean Markdown
            text_response = text_response.replace("```json", "").replace("```", "").strip()
            extracted_data = json.loads(text_response)
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq.")
            # Fallback to Groq 
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f"Extract the item, quantity, and unit from this invoice text. Return ONLY the JSON schema defined in api_contracts.md. If freight/shipping, multiply weight by distance and return 'ton-mile'. If no physical metrics, use total cost (unit: 'usd'). Text: {file_url}"
                    }
                ],
                model="llama3-70b-8192",
            )
            text_response = chat_completion.choices[0].message.content
            text_response = text_response.replace("```json", "").replace("```", "").strip()
            extracted_data = json.loads(text_response)
        
        if isinstance(extracted_data, list):
            extracted_data = extracted_data[0]

        item_name = extracted_data.get("item")
        quantity = extracted_data.get("quantity")
        unit = extracted_data.get("unit")

        # 4. Fetch Emission Factor from Supabase
        factor_resp = supabase.table("emission_factors").select("*").eq("item_name", item_name).execute()
        if not factor_resp.data:
            raise ValueError(f"No emission factor found for item: {item_name}")
        
        factor_data = factor_resp.data[0]
        factor_value = factor_data["factor"]
        factor_unit = factor_data["unit"]

        # 5. Math Calculation
        calc_result = calculate_emissions(
            item=item_name,
            quantity=quantity,
            unit=unit,
            factor=factor_value,
            factor_unit=factor_unit
        )

        total_co2e = calc_result["co2e"]

        # 6. Update Database
        supabase.table("extracted_items").insert({
            "invoice_id": invoice_id,
            "item_description": item_name,
            "quantity": quantity,
            "unit": unit,
            "calculated_co2e": total_co2e
        }).execute()

        supabase.table("invoices").update({
            "status": "Processed",
            "total_co2e": total_co2e
        }).eq("id", invoice_id).execute()
        print(f"Successfully processed invoice {invoice_id}")

    except Exception as e:
        print(f"Error processing invoice {invoice_id}: {e}")
        supabase.table("invoices").update({
            "status": "Failed"
        }).eq("id", invoice_id).execute()

@app.post("/webhook/ledgerzero-ingest")
def handle_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    # Process asynchronously to return 200 immediately to the frontend
    background_tasks.add_task(process_invoice, payload.invoice_id, payload.file_url)
    return {"status": "ok", "message": "Invoice processing started"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}
