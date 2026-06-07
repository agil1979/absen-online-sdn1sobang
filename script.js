// 1. KONFIGURASI
const WEB_APP_URL = "URL_APPS_SCRIPT_ANDA_DI_SINI"; 
const OFFICE_LAT = -6.628209010488044; // Koordinat Anda yang terdeteksi tadi
const OFFICE_LNG = 106.29402842818563;
const MAX_DISTANCE = 100;

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const btnAbsen = document.getElementById('btn-absen');
const locStatus = document.getElementById('location-status');

// 2. KAMERA
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Kamera Error: " + err); });

// 3. HITUNG JARAK
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

// 4. CEK LOKASI OTOMATIS
setInterval(() => {
    navigator.geolocation.getCurrentPosition(pos => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        const dist = getDistance(uLat, uLng, OFFICE_LAT, OFFICE_LNG);

        if (dist <= MAX_DISTANCE) {
            locStatus.innerHTML = `<span style="color:green">LOKASI OK (${Math.round(dist)}m)</span>`;
            btnAbsen.disabled = false;
            btnAbsen.style.backgroundColor = "#28a745"; // Berubah hijau jika OK
        } else {
            locStatus.innerHTML = `<span style="color:red">LUAR RADIUS (${Math.round(dist)}m)</span>`;
            btnAbsen.disabled = true;
            btnAbsen.style.backgroundColor = "#ccc";
        }
    }, err => { console.error(err); }, { enableHighAccuracy: true });
}, 3000);

// 5. PROSES KLIK TOMBOL ABSEN
btnAbsen.addEventListener('click', async () => {
    console.log("Tombol diklik...");
    
    // Ambil Nama
    const nama = prompt("Masukkan Nama Anda:");
    if (!nama) return;

    btnAbsen.innerText = "Memproses...";
    btnAbsen.disabled = true;

    try {
        // Ambil Foto
        canvas.width = 320;
        canvas.height = 240;
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
        const fotoBase64 = canvas.toDataURL('image/jpeg', 0.5);
        console.log("Foto berhasil diambil");

        // Kirim Data
        const payload = {
            nama: nama,
            lat: OFFICE_LAT,
            lng: OFFICE_LNG,
            photo: fotoBase64
        };

        console.log("Mengirim ke Google Sheets...");
        
        // Gunakan fetch dengan mode no-cors agar tidak terhalang kebijakan browser
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert("ABSENSI BERHASIL TERKIRIM!");
        location.reload(); // Refresh halaman setelah sukses

    } catch (err) {
        console.error("Gagal:", err);
        alert("Terjadi kesalahan: " + err.message);
        btnAbsen.disabled = false;
        btnAbsen.innerText = "Coba Lagi";
    }
});