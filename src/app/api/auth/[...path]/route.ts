import type { NextRequest } from "next/server"
import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"

type AuthContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, context: AuthContext) {
  if (!isNeonAuthConfigured()) return Response.json({ message: "Sign-in is unavailable." }, { status: 503 })
  return getAuth().handler().GET(request, context)
}

export async function POST(request: NextRequest, context: AuthContext) {
  if (!isNeonAuthConfigured()) return Response.json({ message: "Sign-in is unavailable." }, { status: 503 })
  return getAuth().handler().POST(request, context)
}
