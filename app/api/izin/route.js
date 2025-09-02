import connectMongoDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import Izin from "@/models/izinInfo";
import Intern from "@/models/internInfo";
import Pembimbing from "@/models/mentorInfo";

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    let waktuIzin;

    // Get data from request
    const { idUser, keteranganIzin, messageIzin, linkBukti } = await request.json();

    try {
      const waktuResponse = await fetch("http://worldtimeapi.org/api/timezone/Asia/Jakarta");
      const waktuData = await waktuResponse.json();
      waktuIzin = new Date(waktuData.datetime);
    } catch (error) {
      // waktuIzin is already initialized with new Date() above
    }
    // Validate data
    if (!idUser || !keteranganIzin || !messageIzin) {
      return NextResponse.json({ 
        error: "Data tidak lengkap" 
      }, { status: 400 });
    }

    // Create new izin object
    const izin = new Izin({
      idUser,
      izinDate: waktuIzin || new Date(),
      keteranganIzin,
      messageIzin, 
      linkBukti
    });

    // Save to database
    await izin.save();

    return NextResponse.json({
      message: "Izin berhasil disimpan",
      izin,
      redirectUrl: "/dashboard",
    }, { status: 201 });

  } catch (error) {
    console.error("Error menyimpan izin:", error);
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat menyimpan izin" 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Get userId and date parameters from URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const pembimbingUserId = searchParams.get("pembimbingUserId");

    let query = {};

    // Jika ada pembimbingUserId, cari izin anak magang yang dibimbing
    if (pembimbingUserId) {
      console.log("Mencari pembimbing dengan userId:", pembimbingUserId);
      const pembimbingData = await Pembimbing.findOne({ userId: pembimbingUserId });

      if (!pembimbingData) {
        console.log("Pembimbing tidak ditemukan");
        return NextResponse.json({ izin: [] }, { status: 200 });
      }

      console.log("Pembimbing ditemukan:", pembimbingData.nama);

      // Cari intern yang dibimbing oleh pembimbing ini
      const interns = await Intern.find({
        pembimbing: pembimbingData._id
      });

      console.log("Jumlah intern bimbingan:", interns.length);

      if (interns.length === 0) {
        return NextResponse.json({ izin: [] }, { status: 200 });
      }

      // Ambil semua userId dari intern yang dibimbing
      const internUserIds = interns.map(intern => intern.userId);

      // Query izin dari semua intern yang dibimbing
      query.idUser = { $in: internUserIds };

      // Jika ada filter tanggal, tambahkan
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.izinDate = {
          $gte: startDate,
          $lt: endDate
        };
      }
    } else if (userId) {
      // Original logic untuk userId
      query.idUser = userId;

      if(date){
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.izinDate = {
          $gte: startDate,
          $lt: endDate
        };
      };
    }

    // Get izin data
    const izinData = await Izin.find(query).sort({ izinDate: -1 });

    // Get all intern data to match with idUser
    const internsData = await Intern.find({});
    const internsMap = {};
    internsData.forEach((intern) => {
      internsMap[intern.userId] = intern.nama;
    });

    // Combine izin data with intern names
    const izinWithNames = izinData.map((izin) => {
      const izinObj = izin.toObject();
      izinObj.nama = internsMap[izin.idUser] || "Nama tidak Ditemukan";
      return izinObj;
    });

    return NextResponse.json({ izin: izinWithNames }, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data izin:", error);
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat mengambil data izin" 
    }, { status: 500 });
  }
}
