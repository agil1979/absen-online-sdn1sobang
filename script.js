<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Absensi Online SDN 1 Sobang</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; padding: 20px; background: #f0f0f0; margin: 0; }
        .container { background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        #camera, #preview { width: 100%; border-radius: 10px; background: #ddd; margin-top: 10px; }
        #preview { display: none; }
        .status { margin: 15px 0; font-weight: bold; padding: 10px; border-radius: 5px; background: #eee; }
        button { background: #ccc; color: white; border: none; padding: 15px; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; margin-top: 10px; }
        button:not(:disabled) { background: #28a745; }
        input { width: 90%; padding: 10px; margin-bottom: 5px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; }
        h2 { color: #333; }
    </style>
</head>
<body>

<div class="container">
    <h2>Absensi Online</h2>
    <p>SDN 1 Sobang</p>
    
    <input type="text" id="nama-karyawan" placeholder="Masukkan Nama Lengkap">
    
    <video id="camera" autoplay playsinline></video>
    <img id="preview">
    <canvas id="canvas" style="display:none;"></canvas>
    
    <div id="location-status" class="status">Mengecek Lokasi...</div>
    
    <button type="button" id="btn-absen" disabled>Ambil Foto & Absen</button>
</div>

<script src="script.js"></script>
</body>
</html>
