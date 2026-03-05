import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function POST(request: Request) {
  try {
    const { placeId } = await request.json();

    if (!placeId || !API_KEY) {
      return NextResponse.json({ error: "Missing placeId or API key" }, { status: 400 });
    }

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "addressComponents",
        },
      }
    );

    const data = await res.json();
    const components = data.addressComponents || [];

    let streetNumber = "";
    let route = "";
    let suburb = "";
    let state = "";
    let postcode = "";

    for (const comp of components) {
      const types: string[] = comp.types || [];
      if (types.includes("street_number")) {
        streetNumber = comp.shortText || comp.longText || "";
      } else if (types.includes("route")) {
        route = comp.shortText || comp.longText || "";
      } else if (types.includes("locality")) {
        suburb = comp.longText || comp.shortText || "";
      } else if (types.includes("administrative_area_level_1")) {
        state = comp.shortText || "";
      } else if (types.includes("postal_code")) {
        postcode = comp.shortText || comp.longText || "";
      }
    }

    const address = [streetNumber, route].filter(Boolean).join(" ");

    return NextResponse.json({ address, suburb, state, postcode });
  } catch (error) {
    console.error("Places details error:", error);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
