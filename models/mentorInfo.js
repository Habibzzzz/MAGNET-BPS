import mongoose from "mongoose";
import { Schema } from "mongoose";

const pembimbingSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    nama: {
        type: String,
        required: [true, "Nama tidak boleh kosong"],
    },
    nip: {
        type: String,
        required: [true, "NIP tidak boleh kosong"],
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email tidak boleh kosong"],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Format email tidak valid']
    },
    divisi: {
        type: String,
        required: [true, "Divisi tidak boleh kosong"],
    },
    status: {
        type: String,
        enum: ['aktif', 'tidak aktif'],
        default: 'aktif',
    },
}, {
    timestamps: true
});

const Pembimbing = mongoose.models.Pembimbing || mongoose.model("Pembimbing", pembimbingSchema);

export default Pembimbing;