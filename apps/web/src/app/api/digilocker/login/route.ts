import { NextResponse } from 'next/server';
import { ElectoralRoll, OTPStore } from '@/models/ElectionModels';
import { connectDB } from '@/lib/mongodb';

// MOCK DIGILOCKER LOGIN: Step 1 (OTP Generation) 🛡️🔐🕵️‍♂️
// Satisfies Roadmap: LOGIN (Check Electoral Roll + Generate OTP)
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });

    // 🛡️ MONGOOSE CONNECTION BRIDGE
    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: 'Database Offline' }, { status: 503 });

    // Check if the phone exists in the Electoral Roll (Source of Truth)
    const person = await ElectoralRoll.findOne({ phone, isActive: true });

    if (!person) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not registered in the Electoral Roll. Only citizens listed can vote.' 
      }, { status: 403 });
    }

    // Rate Limiting Mock (Max 3 per 5 min)
    const rateLimitCheck = await OTPStore.countDocuments({ 
        phone, 
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } 
    });

    if (rateLimitCheck >= 3) {
        return NextResponse.json({ error: 'Maximum OTP attempts reached. Please wait 5 minutes.' }, { status: 429 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute expiry

    // Save to OTP Store
    await OTPStore.create({ 
        phone, 
        otp: otpCode, 
        expiresAt 
    });

    console.log(`✅ [SIMULATION] OTP for ${phone}: ${otpCode}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to your registered mobile number.',
      // For the sake of the demo, we log the OTP in the server console above.
    });

  } catch (err: any) {
    console.error('Login Error:', err.message);
    return NextResponse.json({ error: `Authentication System Failure: ${err.message}` }, { status: 500 });
  }
}
