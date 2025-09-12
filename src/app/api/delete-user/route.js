import { getAuth } from "firebase-admin/auth";
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

// Next.js app directory API route: export POST function
export async function POST(request) {
  try {
    const body = await request.json();
    const { uid } = body;
    if (!uid) {
      return new Response(JSON.stringify({ error: "Missing uid" }), { status: 400 });
    }
    await getAuth().deleteUser(uid);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
