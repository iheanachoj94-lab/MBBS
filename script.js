// YEAR
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// MOBILE MENU
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn && menuBtn.addEventListener('click', () => {
  document.body.classList.toggle('mobile-open');
});
mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => document.body.classList.remove('mobile-open'));
});

// REVEAL ON SCROLL
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// LOADER
(function(){
  const loader = document.getElementById('loader');
  if(!loader) return;
  const bar = loader.querySelector('.progress span');
  let p = 0;
  const tick = setInterval(()=>{
    p += Math.random()*22;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    if (p >= 100){
      clearInterval(tick);
      setTimeout(()=>{
        loader.style.opacity = '0';
        loader.style.transition = 'opacity .5s ease';
        setTimeout(()=> loader.remove(), 500);
      }, 200);
    }
  }, 300);
})();

function getUsers(){
  try { return JSON.parse(localStorage.getItem('wesley_users')||'[]'); }
  catch { return []; }
}
function saveUsers(list){ localStorage.setItem('wesley_users', JSON.stringify(list)); }
function setAuth(email){ localStorage.setItem('wesley_auth', email); }
function clearAuth(){ localStorage.removeItem('wesley_auth'); }
function getAuth(){ return localStorage.getItem('wesley_auth'); }

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm){
  const note = document.getElementById('regNote');
  registerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm).entries());
    if (data.password !== data.password2){
      note.textContent = 'Passwords do not match.';
      return;
    }
    if ((data.password||'').length < 8){
      note.textContent = 'Password must be at least 8 characters.';
      return;
    }
    if (!data.phone || !/^[+0-9 ()-]{7,}$/.test(data.phone)){
      note.textContent = 'Please enter a valid phone number.';
      return;
    }
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())){
      note.textContent = 'An account with this email already exists.';
      return;
    }
    users.push({
      name: data.name,
      email: data.email,
      phone: data.phone,
      level: data.level,
      matric: data.matric || '',
      // NOTE: In production NEVER store raw passwords!
      password: data.password,
      program: 'Medicine & Surgery'
    });
    saveUsers(users);
    note.textContent = `Account created for ${data.name}. You can now login.`;
    registerForm.reset();
    setTimeout(()=> location.href = 'login.html', 800);
  });
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm){
  const note = document.getElementById('authNote');
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password);
    if (!user){
      note.textContent = 'Invalid email or password.';
      return;
    }
    // Optional: block non-MBBS users (we only create MBBS above)
    setAuth(user.email);
    note.textContent = `Welcome back, ${user.name}. Redirecting...`;
    setTimeout(()=> location.href = 'dashboard.html', 600);
  });
}

// LOGOUT
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn){
  logoutBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    clearAuth();
    location.href = 'index.html';
  });
}

// Toggle password show/hide (robust delegated handler)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.password .show');
  if (!btn) return;
  e.preventDefault();

  const targetId = btn.getAttribute('data-target');
  const input = document.getElementById(targetId);
  if (!input) return;

  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Hide' : 'Show';
  btn.setAttribute('aria-pressed', String(show));
});

/* ===========================
   Past Questions Dataset (demo)
   Put real PDFs in /assets/papers/ matching 'file' paths below.
=========================== */
const PAST_QUESTIONS = [
  {level:'100', semester:'First',  year:2023, code:'BIO101', title:'General Biology I', file:'assets/papers/BIO101_2023_First.pdf'},
  {level:'100', semester:'Second', year:2024, code:'CHM102', title:'General Chemistry II', file:'assets/papers/CHM102_2024_Second.pdf'},
  {level:'200', semester:'First',  year:2022, code:'ANA201', title:'Anatomy I', file:'assets/papers/ANA201_2022_First.pdf'},
  {level:'200', semester:'Second', year:2023, code:'PHY202', title:'Physiology II', file:'assets/papers/PHY202_2023_Second.pdf'},
  {level:'300', semester:'First',  year:2021, code:'BIOC301',title:'Biochemistry I', file:'assets/papers/BIOC301_2021_First.pdf'},
  {level:'300', semester:'Second', year:2022, code:'MBG302', title:'Microbiology & Parasitology', file:'assets/papers/MBG302_2022_Second.pdf'},
  {level:'400', semester:'First',  year:2023, code:'PAT401', title:'Pathology I', file:'assets/papers/PAT401_2023_First.pdf'},
  {level:'400', semester:'Second', year:2024, code:'PHA402', title:'Pharmacology II', file:'assets/papers/PHA402_2024_Second.pdf'},
  {level:'500', semester:'First',  year:2020, code:'SUR501', title:'Surgery I', file:'assets/papers/SUR501_2020_First.pdf'},
  {level:'500', semester:'Second', year:2021, code:'MED502', title:'Medicine II', file:'assets/papers/MED502_2021_Second.pdf'},
  {level:'600', semester:'First',  year:2024, code:'OBS601', title:'Obstetrics & Gynaecology I', file:'assets/papers/OBS601_2024_First.pdf'},
  {level:'600', semester:'Second', year:2025, code:'PED602', title:'Paediatrics II', file:'assets/papers/PED602_2025_Second.pdf'}
];

// DASHBOARD: populate year filter and table
(function(){
  const yearSel = document.getElementById('fYear');
  const tbody = document.querySelector('#resultsTable tbody');
  if (!yearSel || !tbody) return;

  // Build Years (unique, desc)
  const years = [...new Set(PAST_QUESTIONS.map(x=>x.year))].sort((a,b)=>b-a);
  years.forEach(y=>{
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSel.appendChild(opt);
  });

  const fLevel = document.getElementById('fLevel');
  const fSem   = document.getElementById('fSem');
  const fCourse= document.getElementById('fCourse');
  const resultCount = document.getElementById('resultCount');

  function render(){
    const L = (fLevel.value||'').trim();
    const S = (fSem.value||'').trim();
    const Y = (yearSel.value||'').trim();
    const C = (fCourse.value||'').trim().toLowerCase();

    const filtered = PAST_QUESTIONS.filter(q=>{
      if (L && q.level !== L) return false;
      if (S && q.semester !== S) return false;
      if (Y && String(q.year) !== Y) return false;
      if (C && !(q.code.toLowerCase().includes(C) || q.title.toLowerCase().includes(C))) return false;
      return true;
    });

    tbody.innerHTML = '';
    filtered.forEach(q=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${q.code}</td>
        <td>${q.title}</td>
        <td>${q.level}L</td>
        <td>${q.semester}</td>
        <td>${q.year}</td>
        <td><a class="btn ghost" href="${q.file}" download>Download</a></td>
      `;
      tbody.appendChild(tr);
    });
    resultCount.textContent = `${filtered.length} result${filtered.length===1?'':'s'}`;
  }

  [fLevel, fSem, yearSel, fCourse].forEach(el=> el && el.addEventListener('input', render));
  document.getElementById('resetFilters')?.addEventListener('click', ()=>{
    fLevel.value = ''; fSem.value = ''; yearSel.value = ''; fCourse.value = '';
    render();
  });

  // CSV Export
  document.getElementById('exportCsv')?.addEventListener('click', ()=>{
    const rows = [['Course Code','Course Title','Level','Semester','Year','File']];
    const L = (fLevel.value||'').trim();
    const S = (fSem.value||'').trim();
    const Y = (yearSel.value||'').trim();
    const C = (fCourse.value||'').trim().toLowerCase();
    const filtered = PAST_QUESTIONS.filter(q=>{
      if (L && q.level !== L) return false;
      if (S && q.semester !== S) return false;
      if (Y && String(q.year) !== Y) return false;
      if (C && !(q.code.toLowerCase().includes(C) || q.title.toLowerCase().includes(C))) return false;
      return true;
    });
    filtered.forEach(q=> rows.push([q.code,q.title, q.level+'L', q.semester, String(q.year), q.file]));
    const csv = rows.map(r=> r.map(x=> `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'past_questions.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  render();
})();
