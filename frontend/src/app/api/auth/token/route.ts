import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { authOptions } from "../[...nextauth]/route"

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_me_in_prod"

export async function GET() {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Create a standard JWT for FastAPI
    // The subject (sub) will be the user's real ID (UUID for Email, Google ID for Google)
    const token = jwt.sign(
        { 
            sub: session.user.id || session.user.email,
            name: session.user.name,
            email: session.user.email,
            picture: session.user.image
        }, 
        JWT_SECRET, 
        { expiresIn: "1d", algorithm: "HS256" }
    )
    
    return NextResponse.json({ token })
}
