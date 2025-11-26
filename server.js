const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;
const DATA_FILE = 'data.json';

// --- HÀM HỖ TRỢ DATA ---
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) { console.error(err); }
    return [];
}
function saveData(data) {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch (err) { console.error(err); }
}

let students = loadData();

// --- CẤU HÌNH ---
app.use(session({ secret: 'key-2025', resave: false, saveUninitialized: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads/')) fs.mkdirSync('uploads/');
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5e6 } });

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

function requireLogin(req, res, next) {
    if (req.session.loggedIn) return next();
    res.redirect('/login');
}

// --- CSS CHUNG ---
const css = `
<style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f6f8; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.05); width: 100%; max-width: 700px; position: relative; }
    h2 { color: #1a73e8; text-align: center; margin-bottom: 25px; }
    
    /* Form Style */
    input, select, textarea { width: 100%; padding: 10px; margin: 5px 0 15px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #1a73e8; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; }
    button:hover { background: #1557b0; }

    /* Preview Image Style */
    .preview-container { text-align: center; margin-bottom: 15px; display: none; }
    .preview-img { width: 120px; height: 120px; border-radius: 10px; object-fit: cover; border: 3px solid #1a73e8; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

    /* Student Card Layout */
    .student-card { 
        display: flex; align-items: flex-start; gap: 15px; padding: 15px; 
        border: 1px solid #eee; border-radius: 8px; background: #fff; margin-bottom: 10px; 
    }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #eee; flex-shrink: 0; }
    .info-section { flex: 1; }
    .action-section { display: flex; flex-direction: column; gap: 5px; min-width: 80px; }
    
    .btn-sm { padding: 6px 10px; font-size: 0.85rem; border-radius: 4px; text-decoration: none; text-align: center; display: block; color: white; border: none; cursor: pointer; width: 100%; box-sizing: border-box;}
    .btn-edit { background: #28a745; }
    .btn-delete { background: #dc3545; }

    .nav { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
    .nav a { margin: 0 15px; text-decoration: none; color: #555; font-weight: bold; }
    .nav a.active { color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 15px;}
    .footer { margin-top: auto; padding-top: 20px; color: #888; font-size: 0.8rem; text-align: center;}
</style>
`;
const footerHtml = `<div class="footer">Demo Student-app Ver 1.5 - 2025 By Nhật Thiện</div>`;

// --- ROUTES ---

// 1. TRANG LOGIN 
app.get('/login', (req, res) => res.send(`
    <!DOCTYPE html><html><head><title>Đăng nhập</title>${css}</head><body>
    <div class="container" style="max-width:400px;">
        <h2>Đăng nhập</h2>
        <form action="/login" method="POST">
            <label>Tài khoản:</label><input name="username" placeholder="admin">
            <label>Mật khẩu:</label><input type="password" name="password" placeholder="123456">
            <button>Đăng nhập</button>
        </form>
    </div>
    </body></html>
`));

app.post('/login', (req, res) => { if(req.body.username==='admin' && req.body.password==='123456'){ req.session.loggedIn=true; res.redirect('/admin'); } else res.redirect('/login'); });
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// 2. TRANG ĐĂNG KÝ 
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html><html><head><title>Đăng ký</title>${css}
    <script>
        function previewImage(event) {
            const reader = new FileReader();
            reader.onload = function(){
                const output = document.getElementById('preview');
                output.src = reader.result;
                document.getElementById('preview-box').style.display = 'block';
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    </script>
    </head><body>
    <div class="container">
        <div class="nav"><a href="/" class="active">Đăng ký</a><a href="/admin">Quản trị</a></div>
        <h2>Hồ Sơ Sinh Viên</h2>
        ${req.query.error ? `<p style="color:red;text-align:center">${req.query.error}</p>` : ''}
        
        <form action="/submit" method="POST" enctype="multipart/form-data">
            <label>Avatar:</label>
            <input type="file" name="avatar" accept="image/*" required onchange="previewImage(event)">
            
            <!-- Khung Preview -->
            <div id="preview-box" class="preview-container">
                <img id="preview" class="preview-img">
                <div style="font-size:0.8rem;color:#666;margin-top:5px;">Ảnh xem trước</div>
            </div>

            <label>Họ tên:</label><input name="fullname" required>
            <label>MSSV:</label><input name="mssv" required>
            <label>SĐT:</label><input name="phone" type="number" required>
            
            <label>Ngành Học:</label>
            <select name="major">
                <option>Quản Trị Kinh Doanh</option>
                <option>Công Nghệ Thông Tin</option>
                <option>Thiết Kế Thời Trang</option>
                <option>Ngôn Ngữ Anh</option>
            </select>

            <label>Trường:</label>
            <select name="school">
                <option>ĐH Văn Lang</option><option>ĐH Bách Khoa</option><option>ĐH RMIT</option><option>ĐH Kinh Tế</option><option>ĐH FPT</option><option>Khác</option>
            </select>
            
            <label>Sở thích:</label><textarea name="hobbies"></textarea>
            <button>Gửi Hồ Sơ</button>
        </form>
    </div>${footerHtml}</body></html>`);
});

app.post('/submit', upload.single('avatar'), (req, res) => {
    const data = req.body;
    if (students.some(s => s.mssv === data.mssv)) return res.redirect('/?error=Trùng MSSV!');
    
    data.timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    data.avatarPath = req.file ? '/' + req.file.path.replace(/\\/g, '/') : null;
    
    students.unshift(data); 
    saveData(students);
    res.redirect('/success');
});

// 3. TRANG THÀNH CÔNG (Màu nền Gradient + Pháo hoa vô tận)
app.get('/success', (req, res) => {
    res.send(`
    <!DOCTYPE html><html><head>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        /* Override body background cho trang này */
        body { 
            background: linear-gradient(135deg, #18A5A7, #BFFFC7) !important; 
            font-family: 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; 
        }
        .container { background: white; padding: 40px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 90%; max-width: 500px; }
        h2 { color: #28a745; font-size: 2.5rem; margin: 0 0 10px; }
        button { padding: 12px 30px; background: #18A5A7; color: white; border: none; border-radius: 25px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 20px;}
        button:hover { background: #138486; transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    </style>
    </head><body>
        <div class="container">
            <h2>Thành công! 🎉</h2>
            <p style="font-size: 1.2rem; color: #555;">Hồ sơ đã được lưu trữ an toàn.</p>
            <a href="/"><button>Tiếp tục nhập</button></a>
        </div>
        <script>
            // Pháo hoa bắn liên tục (setInterval)
            var duration = 15 * 1000;
            var end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });

                // Lặp lại vô tận cho đến khi người dùng rời đi
                requestAnimationFrame(frame);
            }());
        </script>
    </body></html>`);
});

// 4. TRANG ADMIN (Hiển thị Ngành học)
app.get('/admin', requireLogin, (req, res) => {
    const k = (req.query.keyword || "").toLowerCase();
    const list = students.filter(s => s.fullname.toLowerCase().includes(k) || s.mssv.includes(k)).map(s => `
        <div class="student-card">
            <img src="${s.avatarPath}" class="avatar" onerror="this.src='https://via.placeholder.com/80'">
            
            <div class="info-section">
                <div style="font-size:16px;"><strong>${s.fullname}</strong> <span style="color:red;font-weight:bold">(${s.school})</span></div>
                <div><b>MSSV:</b> ${s.mssv} | <b>SĐT:</b> ${s.phone}</div>
                <div><b>Ngành:</b> ${s.major || 'Chưa cập nhật'}</div>
                <div><b>Sở thích:</b> ${s.hobbies || '-'}</div>
                <small style="color:#888">${s.timestamp}</small>
            </div>

            <div class="action-section">
                <a href="/admin/edit/${s.mssv}" class="btn-sm btn-edit">Sửa</a>
                <form action="/admin/delete" method="POST" onsubmit="return confirm('Xóa nhé?');" style="margin:0;">
                    <input type="hidden" name="mssv" value="${s.mssv}">
                    <button class="btn-sm btn-delete">Xóa</button>
                </form>
            </div>
        </div>
    `).join('') || '<p align="center">Trống</p>';

    res.send(`<!DOCTYPE html><html><head><title>Admin</title>${css}</head><body>
    <div class="container"><div class="nav"><a href="/">Đăng ký</a><a href="/admin" class="active">Quản trị</a><a href="/logout" style="float:right;color:red;font-size:0.9rem">Thoát</a></div>
    <h2>Danh sách (${students.length})</h2>
    <a href="/admin/export"><button style="background:#28a745;margin-bottom:15px">Excel</button></a>
    <form action="/admin" method="GET" style="display:flex;gap:5px"><input name="keyword" value="${req.query.keyword||''}" placeholder="Tìm..."><button style="width:80px;margin-top:5px">Tìm</button></form>
    <div style="margin-top:20px">${list}</div></div>${footerHtml}</body></html>`);
});

// 5. TRANG EDIT (Sửa Ngành học)
app.get('/admin/edit/:mssv', requireLogin, (req, res) => {
    const s = students.find(x => x.mssv === req.params.mssv);
    if (!s) return res.redirect('/admin');

    // Helper check selected
    const sel = (val) => s.major === val ? 'selected' : '';

    res.send(`<!DOCTYPE html><html><head><title>Sửa</title>${css}</head><body>
    <div class="container"><h2>Chỉnh sửa hồ sơ</h2>
    <form action="/admin/update" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="oldMssv" value="${s.mssv}">
        <label>Avatar (Bỏ trống nếu không đổi):</label><input type="file" name="avatar">
        
        <label>Họ tên:</label><input name="fullname" value="${s.fullname}" required>
        <label>MSSV:</label><input name="mssv" value="${s.mssv}" required>
        <label>SĐT:</label><input name="phone" value="${s.phone}" type="number" required>
        
        <label>Ngành Học:</label>
        <select name="major">
            <option ${sel('Quản Trị Kinh Doanh')}>Quản Trị Kinh Doanh</option>
            <option ${sel('Công Nghệ Thông Tin')}>Công Nghệ Thông Tin</option>
            <option ${sel('Thiết Kế Thời Trang')}>Thiết Kế Thời Trang</option>
            <option ${sel('Ngôn Ngữ Anh')}>Ngôn Ngữ Anh</option>
        </select>

        <label>Trường:</label>
        <select name="school">
            <option ${s.school=='ĐH Văn Lang'?'selected':''}>ĐH Văn Lang</option>
            <option ${s.school=='ĐH Bách Khoa'?'selected':''}>ĐH Bách Khoa</option>
            <option ${s.school=='ĐH RMIT'?'selected':''}>ĐH RMIT</option>
            <option ${s.school=='ĐH Kinh Tế'?'selected':''}>ĐH Kinh Tế</option>
            <option ${s.school=='ĐH FPT'?'selected':''}>ĐH FPT</option>
            <option ${s.school=='Khác'?'selected':''}>Khác</option>
        </select>

        <label>Sở thích:</label><textarea name="hobbies">${s.hobbies}</textarea>
        <button style="background:#28a745">Lưu Thay Đổi</button>
        <a href="/admin" style="display:block;text-align:center;margin-top:10px;text-decoration:none;color:#555">Hủy</a>
    </form></div></body></html>`);
});

app.post('/admin/update', upload.single('avatar'), (req, res) => {
    const { oldMssv, fullname, mssv, phone, school, major, hobbies } = req.body;
    const idx = students.findIndex(s => s.mssv === oldMssv);
    
    if (idx !== -1) {
        students[idx].fullname = fullname;
        students[idx].mssv = mssv;
        students[idx].phone = phone;
        students[idx].school = school;
        students[idx].major = major; 
        students[idx].hobbies = hobbies;
        if (req.file) students[idx].avatarPath = '/' + req.file.path.replace(/\\/g, '/');
        saveData(students);
    }
    res.redirect('/admin');
});

app.post('/admin/delete', requireLogin, (req, res) => {
    students = students.filter(s => s.mssv !== req.body.mssv);
    saveData(students);
    res.redirect('/admin');
});

// Xuất Excel có cột Ngành
app.get('/admin/export', requireLogin, async (req, res) => {
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('DS');
    ws.columns = [
        {header:'Time',key:'timestamp',width:20},
        {header:'Ten',key:'fullname',width:25},
        {header:'MSSV',key:'mssv',width:15},
        {header:'SDT',key:'phone',width:15},
        {header:'Nganh',key:'major',width:25}, 
        {header:'Truong',key:'school',width:20},
        {header:'So thich',key:'hobbies',width:30}
    ];
    students.forEach(s => ws.addRow(s));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DS_SinhVien.xlsx');
    await wb.xlsx.write(res); res.end();
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
if (!fs.existsSync(DATA_FILE)) saveData([]);