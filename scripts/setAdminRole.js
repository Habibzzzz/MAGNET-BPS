const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("../serviceAccountKey.json");

initializeApp({
    credential: cert(serviceAccount),
});

const setAdminRole = async () => {
    try {
        const user = await getAuth().getUserByEmail("pembimbing@gmail.com");
        await getAuth().setCustomUserClaims(user.uid, { role: "pembimbing" });
        console.log(`Role pembimbing berhasil di-set untuk ${user.email}`);
        // const user = await getAuth().getUserByEmail("bps1871@gmail.com");
        // await getAuth().setCustomUserClaims(user.uid, { role: "admin" });
        // console.log(`Role admin berhasil di-set untuk ${user.email}`);
    } catch (error) {
        console.error("Gagal set role:", error.message);
    }
};

setAdminRole();
