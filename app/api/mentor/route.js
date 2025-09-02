import { NextResponse } from "next/server";
import Pembimbing from "@/models/mentorInfo";
import connectMongoDB from "@/libs/mongodb";

export async function GET() {
    await connectMongoDB();
    try {
        const mentors = await Pembimbing.find({ status: 'aktif' });
        return NextResponse.json(mentors, {status: 200});
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil data pembimbing.", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { userId, nama, nip, email, status, divisi } = body;

    await connectMongoDB();

    try {
        await Pembimbing.create({
            userId, nama, nip, email, status, divisi
        });

        return NextResponse.json({ message: "Data pembimbing berhasil ditambahkan" }, { status: 201 });

    } catch (error) {
        if (error.code === 11000) {
            let duplicateField = Object.keys(error.keyValue)[0];
            let userMessage = `Error: ${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} yang Anda masukkan sudah terdaftar.`;

            return NextResponse.json(
                { message: userMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server.", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    const id = request.nextUrl.searchParams.get('id');

    await connectMongoDB();
    await Pembimbing.findByIdAndDelete(id);

    return NextResponse.json({ message: "Data Pembimbing Berhasil dihapus" }, { status: 200 });
}