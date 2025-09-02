import mongoose from "mongoose";
const { Schema } = mongoose;

const assessmentSchema = new Schema({
    internId: {
        type: Schema.Types.ObjectId,
        ref: "Intern",
        required: true,
        index: true
    },
    aspekNilai: {
        komunikasi: { type: Number, default: -1 },
        kerjaTim: { type: Number, default: -1 },
        kedisiplinan: { type: Number, default: -1 },
        inisiatif: { type: Number, default: -1 },
        tanggungJawab: { type: Number, default: -1 },
        catatan: { type: String, default: "" },
    },
    penilai: {
        type: String,
        required: true,
    },
    tanggalDinilai: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);

export default Assessment;
