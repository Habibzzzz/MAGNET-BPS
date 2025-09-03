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

// Ensure model is always registered properly
let Pembimbing;
try {
    // Check if model exists
    Pembimbing = mongoose.models.Pembimbing;
    if (!Pembimbing) {
        // If model doesn't exist, create it
        Pembimbing = mongoose.model("Pembimbing", pembimbingSchema);
    }
} catch (error) {
    // If there's any error, force create the model
    Pembimbing = mongoose.model("Pembimbing", pembimbingSchema);
}

export default Pembimbing;