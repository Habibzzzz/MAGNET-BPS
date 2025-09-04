import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DaftarHadir from "@/models/daftarHadirInfo";
import fetch from "node-fetch";
import Intern from "@/models/internInfo";

export async function POST(request) {
  try {
    // Ambil data dari request
    const body = await request.json();
    console.log("📥 Received data:", body);
    
    const { userId, nama, longCordinate, latCordinate, dailyNote } = body;
    let KeteranganAbsen = "";
    let jam, menit, waktuResponse, waktuData, waktu;

    try {
      // Use HTTPS instead of HTTP for Vercel
      waktuResponse = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jakarta", {
        timeout: 5000,
        headers: {
          'User-Agent': 'MAGNET-BPS/1.0'
        }
      });
      
      if (!waktuResponse.ok) {
        throw new Error(`Time API failed: ${waktuResponse.status}`);
      }
      
      waktuData = await waktuResponse.json();
      waktu = new Date(waktuData.datetime);
      jam = waktu.getHours();
      menit = waktu.getMinutes();
      
      console.log(`User mengisi di waktu yang diperbolehkan, yaitu pada jam ${jam}`);
    } catch (error) {
      console.error("WorldTime API error, using server time:", error);
      // Fallback to server time with Jakarta timezone
      waktu = new Date();
      // Convert to Jakarta time (UTC+7)
      const jakartaTime = new Date(waktu.getTime() + (7 * 60 * 60 * 1000));
      jam = jakartaTime.getHours();
      menit = jakartaTime.getMinutes();
      console.log(`Fallback: User mengisi di waktu server, yaitu pada jam ${jam}`);
    }

    // Validasi waktu dan set keterangan absen berdasarkan jam
    let jenisAbsen = "";
    
    if (jam < 12) {
      // Absen Datang (sebelum jam 12)
      jenisAbsen = "datang";
      if ((jam >= 5 && jam < 7) || (jam === 7 && menit <= 30)) {
        KeteranganAbsen = "Datang Tepat Waktu";
      } else if ((jam === 7 && menit > 30) || (jam > 7 && jam < 12)) {
        KeteranganAbsen = "Datang Terlambat";
      } else {
        return NextResponse.json({ 
          error: "Anda mengisi absen datang di luar jam yang ditentukan (05:00-11:59)" 
        }, { status: 400 });
      }
    } else {
      // Absen Pulang (jam 12 ke atas)
      jenisAbsen = "pulang";
      if (jam >= 12 && jam < 16) {
        KeteranganAbsen = "Pulang Cepat";
      } else if (jam === 16) {
        KeteranganAbsen = "Pulang Tepat Waktu";
      } else if (jam > 16 && jam < 23) {
        KeteranganAbsen = "Pulang Lembur";
      } else {
        return NextResponse.json({ 
          error: "Anda mengisi absen pulang di luar jam yang ditentukan (12:00-22:59)" 
        }, { status: 400 });
      }
    }

    // Connect ke MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await connectMongoDB();
    console.log("✅ MongoDB connected successfully");

    // Validasi data
    console.log("🔍 Validating data...", { 
      userId: userId ? "✅" : "❌", 
      longCordinate: longCordinate ? "✅" : "❌", 
      latCordinate: latCordinate ? "✅" : "❌", 
      dailyNote: dailyNote ? "✅" : "❌" 
    });
    
    if (!userId || !longCordinate || !latCordinate || !dailyNote) {
      console.error("❌ Validation failed - missing data:", { 
        userId: !!userId, 
        longCordinate: !!longCordinate, 
        latCordinate: !!latCordinate, 
        dailyNote: !!dailyNote,
        raw_userId: userId,
        raw_longCordinate: longCordinate,
        raw_latCordinate: latCordinate,
        raw_dailyNote: dailyNote
      });
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek apakah sudah ada absen hari ini
    const today = new Date(waktuData);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAbsen = await DaftarHadir.findOne({
      idUser: userId,
      absenDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    let absensi;

    if (jenisAbsen === "datang") {
      if (existingAbsen) {
        return NextResponse.json({ 
          error: "Anda sudah melakukan absen datang hari ini" 
        }, { status: 400 });
      }

      // Buat absen datang baru
      absensi = new DaftarHadir({
        idUser: userId,
        absenDate: waktuData,
        longCordinate: parseFloat(longCordinate),
        latCordinate: parseFloat(latCordinate),
        messageText: dailyNote,
        keteranganMasuk: KeteranganAbsen,
        jenisAbsen: "datang"
      });

      await absensi.save();
    } else {
      // jenisAbsen === "pulang"
      if (!existingAbsen) {
        // Jika belum ada absen datang, buat absen baru dengan status pulang
        absensi = new DaftarHadir({
          idUser: userId,
          absenDate: waktuData,
          checkoutTime: waktuData, // Langsung set checkout time
          longCordinate: parseFloat(longCordinate),
          latCordinate: parseFloat(latCordinate),
          checkoutLongCordinate: parseFloat(longCordinate),
          checkoutLatCordinate: parseFloat(latCordinate),
          messageText: "Tidak ada catatan datang", // Default message
          checkoutMessageText: dailyNote,
          keteranganMasuk: `Tidak Absen Datang | ${KeteranganAbsen}`,
          jenisAbsen: "pulang"
        });

        await absensi.save();
      } else if (existingAbsen.checkoutTime) {
        return NextResponse.json({ 
          error: "Anda sudah melakukan absen pulang hari ini" 
        }, { status: 400 });
      } else {
        // Update absen yang sudah ada dengan waktu pulang
        existingAbsen.checkoutTime = waktuData;
        existingAbsen.checkoutLongCordinate = parseFloat(longCordinate);
        existingAbsen.checkoutLatCordinate = parseFloat(latCordinate);
        existingAbsen.checkoutMessageText = dailyNote;
        existingAbsen.keteranganMasuk = `${existingAbsen.keteranganMasuk} | ${KeteranganAbsen}`;
        
        await existingAbsen.save();
        absensi = existingAbsen;
      }
    }

    return NextResponse.json({
      message: jenisAbsen === "datang" ? "Absen datang berhasil disimpan" : "Absen pulang berhasil disimpan",
      absensi,
      jenisAbsen,
      redirectUrl: "/historiDaftarHadir",
    }, { status: 201 });

  } catch (error) {
    console.error("Error menyimpan absensi:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat menyimpan absensi",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Connect ke MongoDB
    await connectMongoDB();

    // Ambil parameter userId dan date dari URL jika ada
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    let query = {};
    if (userId) {
      query.idUser = userId;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.absenDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Ambil data absensi
    const absensiData = await DaftarHadir.find(query).sort({ absenDate: -1 });

    // Ambil semua data absensi intern untuk dicocokkan dengan idUser
    const internsData = await Intern.find({});
    const internsMap = {};
    internsData.forEach((intern) => {
      internsMap[intern.userId] = intern.nama;
    });

    // Gabungkan data absensi dengan nama Intern
    const absensiWithNames = absensiData.map((absen) => {
      const absenObj = absen.toObject();
      absenObj.nama = internsMap[absen.idUser] || "Nama tidak Ditemukan";
      return absenObj;
    });

    return NextResponse.json({ absensi: absensiWithNames }, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data absensi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data absensi" }, { status: 500 });
  }
}