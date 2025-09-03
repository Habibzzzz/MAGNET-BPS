import Intern from "@/models/internInfo";
import { Pembimbing } from "@/models";
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        await connectMongoDB();
        
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json(
                { message: "ID intern diperlukan" },
                { status: 400 }
            );
        }

        const intern = await Intern.findById(id).populate('pembimbing', 'nama nip email divisi');
        
        if (!intern) {
            return NextResponse.json(
                { message: "Data intern tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({ intern });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data intern", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectMongoDB();
        
        const { id } = await params;
        const body = await request.json();
        
        if (!id) {
            return NextResponse.json(
                { message: "ID intern diperlukan" },
                { status: 400 }
            );
        }

        // Map the request body to correct field names
        const updateData = {
            nama: body.newNama || body.nama,
            nim: body.newNim || body.nim,
            nik: body.newNik || body.nik,
            prodi: body.newProdi || body.prodi,
            kampus: body.newKampus || body.kampus,
            tanggalMulai: body.newTanggalMulai || body.tanggalMulai,
            tanggalSelesai: body.newTanggalSelesai || body.tanggalSelesai,
            divisi: body.newDivisi || body.divisi,
            status: body.newStatus || body.status,
            pembimbing: body.newPembimbing || body.pembimbing,
            ...(body.newNomorSertifikat !== undefined && { nomorSertifikat: body.newNomorSertifikat })
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        console.log("Update data:", updateData);

        const updatedIntern = await Intern.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('pembimbing', 'nama nip email divisi');

        if (!updatedIntern) {
            return NextResponse.json(
                { message: "Data intern tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Data intern berhasil diupdate",
            intern: updatedIntern
        });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { message: "Gagal mengupdate data intern", error: error.message },
            { status: 500 }
        );
    }
}
