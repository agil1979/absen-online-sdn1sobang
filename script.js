const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJ-BHo7nOTVO7iEFhGzVRwkAY5ybixq8NjFv4jOdx4nwZe0TyY8Se2qrP1j5yGCNZF/exec"; // PASTIKAN SUDAH DIGANTI!
const OFFICE_LAT = -6.2146; 
const OFFICE_LNG = 106.8451;
const MAX_DISTANCE = 100;

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const btnAbsen = document.getElementById('btn-absen');
const locStatus = document.getElementById('location-status');
const inputNama = document.getElementById('nama-karyawan');

// 1. Setup Kamera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;
    } catch (err) {
        alert("Kamera tidak bisa diakses. Izinkan akses kamera!");
    }
}

// 2. Cek Jarak
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 3. Cek Lokasi
function checkLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        if (dist <= MAX_DISTANCE) {
            locStatus.innerHTML = "<span class='success'>Lokasi Terverifikasi!</span>";
            btnAbsen.disabled = false;
        } else {
            locStatus.innerHTML = `<span class='error'>Di Luar Radius (${Math.round(dist)}m)</span>`;
        }
    }, (err) => {
        locStatus.innerHTML = "Gagal akses GPS. Aktifkan GPS!";
    }, { enableHighAccuracy: true });
}

// 4. Tombol Absen (Fungsi Utama)
btnAbsen.addEventListener('click', async () => {
    const nama = inputNama.value;
    if (!nama) {
        alert("Silakan isi nama terlebih dahulu!");
        return;
    }

    // Ubah status tombol agar user tahu proses sedang berjalan
    btnAbsen.disabled = true;
    btnAbsen.innerText = "Sedang Mengirim...";

    try {
        // Ambil foto dari video
        canvas.width = 320;
        canvas.height = 240;
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
        const imgData = canvas.toDataURL('image/jpeg', 0.6);

        // Tampilkan preview
        preview.src = imgData;
        preview.style.display = "block";
        video.style.display = "none";

        // Dapatkan koordinat terakhir
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const payload = {
                nama: nama,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                photo: imgData
            };

            // Kirim ke Google Sheets
            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                mode: "no-cors", // Gunakan no-cors jika fetch biasa error di GitHub
                body: JSON.stringify(payload)
            });

            // Karena no-cors, kita tidak bisa baca respon JSON, 
            // Jadi kita asumsikan berhasil jika tidak ada error lemparan (catch)
            alert("Absensi Terkirim! Silakan cek Google Sheets.");
            btnAbsen.innerText = "Berhasil!";
        });

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan teknis. Cek koneksi.");
        btnAbsen.disabled = false;
        btnAbsen.innerText = "Coba Lagi";
    }
});

window.onload = () => {
    setupCamera();
    checkLocation();
};