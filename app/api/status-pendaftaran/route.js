import Intern from "@/models/internInfo";
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectMongoDB();

        // Ambil data intern yang statusnya pending atau dikeluarkan (ditolak)
        const pendingInterns = await Intern.find({
            status: { $in: ["pending", "dikeluarkan"] }
        })
        .select('nama nim kampus prodi status createdAt tanggalMulai tanggalSelesai')
        .sort({ createdAt: -1 }); // Sort by newest first

        // Group by status untuk lebih organized
        const statusData = {
            pending: pendingInterns.filter(intern => intern.status === "pending"),
            ditolak: pendingInterns.filter(intern => intern.status === "dikeluarkan")
        };

        return NextResponse.json({
            success: true,
            data: statusData,
            totalPending: statusData.pending.length,
            totalDitolak: statusData.ditolak.length
        });

    } catch (error) {
        console.error("GET Status Pendaftaran Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Gagal mengambil data status pendaftaran", 
                error: error.message 
            },
            { status: 500 }
        );
    }
}
