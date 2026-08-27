import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calculateEmissions } from '@/lib/calculator';

export const maxDuration = 10; // 10 second max — fail fast

export async function POST(req: NextRequest) {
  let invoiceId = '';

  try {
    const body = await req.json();
    invoiceId = body.invoice_id;
    const fileUrl: string = body.file_url;

    if (!invoiceId || !fileUrl) {
      return NextResponse.json({ error: 'Missing invoice_id or file_url' }, { status: 400 });
    }

    // 1. Update status to Processing
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'Processing' })
      .eq('id', invoiceId);

    // 2. Download the file
    const fileResp = await fetch(fileUrl, { signal: AbortSignal.timeout(8000) });
    if (!fileResp.ok) throw new Error(`Failed to download file: ${fileResp.status}`);
    const fileBuffer = await fileResp.arrayBuffer();
    const fileData = Buffer.from(fileBuffer);

    // 3. Determine MIME type
    const lowerUrl = fileUrl.toLowerCase();
    let mimeType = 'image/jpeg';
    if (lowerUrl.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (lowerUrl.endsWith('.png')) mimeType = 'image/png';

    // 4. AI Extraction — Primary: Gemini, Fallback: Groq
    let extractedData: { item: string; quantity: number; unit: string } | null = null;

    const prompt = `Extract the item, quantity, and unit from this invoice. Return ONLY a JSON object like: {"item": "...", "quantity": 123, "unit": "..."}. If this is a freight/shipping invoice with weight and distance, multiply the weight by the distance and return the result as 'ton-mile' or 'ton-km'. If there are no physical metrics, use the total cost as a fallback (unit: 'usd'). Return ONLY the JSON, no markdown.`;

    try {
      // Gemini
      const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: fileData.toString('base64') } },
      ]);

      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(text);
    } catch (geminiErr) {
      console.error('Gemini failed, falling back to Groq:', geminiErr);

      // Groq fallback
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
      const chat = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nInvoice file URL: ${fileUrl}`,
          },
        ],
        model: 'qwen/qwen3.8-27b',
      });

      let text = chat.choices[0].message.content || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(text);
    }

    // Handle array response from AI
    if (Array.isArray(extractedData)) {
      extractedData = extractedData[0];
    }

    if (!extractedData) throw new Error('AI returned empty data');

    const itemName = extractedData.item;
    const quantity = extractedData.quantity;
    const unit = extractedData.unit;

    // 5. Fetch Emission Factor
    const { data: factors } = await supabaseAdmin
      .from('emission_factors')
      .select('*')
      .eq('item_name', itemName);

    if (!factors || factors.length === 0) {
      throw new Error(`No emission factor found for: ${itemName}`);
    }

    const factorData = factors[0];

    // 6. Calculate CO2e
    const result = calculateEmissions(
      itemName, quantity, unit,
      factorData.factor, factorData.unit
    );

    // 7. Save to database
    await supabaseAdmin.from('extracted_items').insert({
      invoice_id: invoiceId,
      item_description: itemName,
      quantity,
      unit,
      calculated_co2e: result.co2e,
    });

    await supabaseAdmin
      .from('invoices')
      .update({ status: 'Processed', total_co2e: result.co2e })
      .eq('id', invoiceId);

    return NextResponse.json({ status: 'ok', co2e: result.co2e });

  } catch (err: any) {
    console.error('Webhook processing error:', err);

    // Mark invoice as Failed
    if (invoiceId) {
      try {
        await supabaseAdmin
          .from('invoices')
          .update({ status: 'Failed' })
          .eq('id', invoiceId);
      } catch (_) { /* ignore cleanup errors */ }
    }

    return NextResponse.json(
      { error: err.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
