export async function fetchInternsByMonth(month) {
    try {
        const res = await fetch(`/api/intern?month=${month}`, {
            cache: 'no-store',
        });

        if (!res.ok) throw new Error("Gagal memuat data intern");

        return await res.json();
    } catch (error) {
        console.error("Error saat fetch interns:", error.message);
        return { interns: [] };
    }
}
