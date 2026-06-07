// GANTI URL INI DENGAN MILIK ANDA
const WEB_APP_URL = "URL_APPS_SCRIPT_ANDA_DI_SINI"; 

// KOORDINAT KANTOR
const OFFICE_LAT = -6.628209010488044;
const OFFICE_LNG = 106.29402842818563;
const MAX_DISTANCE = 100;

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const btnAbsen = document.getElementById('btn-absen');
const locStatus = document.getElementById('location-status');
const inputNama = document.getElementById('nama-karyawan');

// Kamera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => alert("Kamera Error: " + err));

// Hitung Jarak
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Cek Lokasi tiap 3 detik
setInterval(() => {
    navigator.geolocation.getCurrentPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG);
        if (dist <= MAX_DISTANCE) {
            locStatus.innerHTML = `<span style="color:green">LOKASI OK (${Math.round(dist)}m)</span>`;
            btnAbsen.disabled = false;
            btnAbsen.style.background = "#28a745";
        } else {
            locStatus.innerHTML = `<span style="color:red">LUAR RADIUS (${Math.round(dist)}m)</span>`;
            btnAbsen.disabled = true;
            btnAbsen.style.background = "#ccc";
        }
    }, err => console.error(err), { enableHighAccuracy: true });
}, 3000);

// Tombol Absen
btnAbsen.addEventListener('click', async () => {
    const nama = inputNama.value;
    if (!nama) {
        alert("Isi nama dulu!");
        return;
    }

    btnAbsen.innerText = "Memproses...";
    btnAbsen.disabled = true;

    canvas.width = 320;
    canvas.height = 240;
    canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.5);

    preview.src = fotoBase64;
    preview.style.display = "block";
    video.style.display = "none";

    navigator.geolocation.getCurrentPosition(async pos => {
        const payload = {
            nama: nama,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            photo: fotoBase64
        };

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            alert("ABSENSI BERHASIL TERKIRIM!");
            btnAbsen.innerText = "BERHASIL";
        } catch (err) {
            alert("Gagal kirim: " + err);
            btnAbsen.disabled = false;
            btnAbsen.innerText = "Coba Lagi";
        }
    });
});