import { NextResponse } from "next/server";
import Pembimbing from "@/models/mentorInfo";
import connectMongoDB from "@/libs/mongodb";

export async function GET(request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const nip = searchParams.get('nip');

    if (!nip) {
        return NextResponse.json({ exists: false, message: "NIP is required" }, { status: 400 });
    }

    try {
        const pembimbing = await Pembimbing.findOne({ nip }).lean();
        return NextResponse.json({ exists: !!pembimbing });
    } catch (error) {
        return NextResponse.json({ exists: false, message: "Server error" }, { status: 500 });
    }
}