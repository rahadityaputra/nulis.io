# NULIS.IO (Frontend)

Frontend sederhana untuk CRUD task/catatan.

## Cara menjalankan

Penting: karena memakai ES Modules (`type="module"` + `import ...`), sebaiknya jangan dibuka lewat `file://`.

Jalankan lewat web server lokal:

```bash
cd .
python3 -m http.server 5173
```

Lalu buka:

- `http://localhost:5173/`

Backend harus berjalan di:

- `http://localhost:3000`

## API

Endpoint diset di `src/utils/apiConfig.js`.
