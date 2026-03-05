import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || input.length < 3) {
      return NextResponse.json({ predictions: [] });
    }

    if (!API_KEY) {
      return NextResponse.json({ predictions: [] });
    }

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["au"],
        includedPrimaryTypes: ["street_address", "premise", "subpremise"],
        languageCode: "en-AU",
      }),
    });

    const data = await res.json();

    const predictions = (data.suggestions || [])
      .filter((s: { placePrediction?: unknown }) => s.placePrediction)
      .map((s: { placePrediction: { placeId: string; text: { text: string }; structuredFormat: { mainText: { text: string }; secondaryText: { text: string } } } }) => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text?.text || "",
        mainText: s.placePrediction.structuredFormat?.mainText?.text || "",
        secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || "",
      }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json({ predictions: [] });
  }
}
