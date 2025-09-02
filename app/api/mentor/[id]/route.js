import connectMongoDB from "@/libs/mongodb";
import Pembimbing from "@/models/mentorInfo";
import { NextResponse } from "next/server";

export async function PUT (request, { params }) {
    const { id } = params;

    const {
        newUserId: userId,
        newNama: nama,
        newNip: nip,
        newEmail: email,
        newDivisi: divisi,
        newStatus: status,
    } = await request.json();

    await connectMongoDB();

    await Pembimbing.findByIdAndUpdate(id, {
        userId,
        nama,
        nip,
        email,
        divisi,
        status
    });

    return NextResponse.json({ message: "Data Mentor berhasil diperbarui "});
}

export async function GET(request, { params }) {
    const { id } = params;
    await connectMongoDB();
    const pembimbing = await Pembimbing.findOne({ _id: id });
    return NextResponse.json({ pembimbing }, { status: 200 });
}