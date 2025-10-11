import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ ok: true, message: "Upload current path API is working." });
}

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("[uploadCurrentPath] Received body:", body);

        if (!body || !body.path) {
            return NextResponse.json({ ok: false, error: "Missing 'path' in request body." }, { status: 400 });
        }
        
        // Here you can add logic to handle the uploaded path as needed.
        // For demonstration, we just log it and return a success response.
        console.log("[uploadCurrentPath] Uploaded path:", body.path);
        
        return NextResponse.json({ ok: true, message: "Path uploaded successfully.", path: body.path });
    } catch (e) {
        console.error("[uploadCurrentPath] Error:", e);
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}