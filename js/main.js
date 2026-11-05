'use strict';

// Единый учебный каталог: прайс, запись, корзина и отзывы используют эти данные.
const SERVICES = [
    { id: 'haircut', name: 'Женская стрижка и укладка', category: 'Волосы', duration: 60, masterIds: ['master1', 'master3'], prices: { regular: 10000, top: 13000 } },
    { id: 'men-haircut', name: 'Мужская стрижка', category: 'Волосы', duration: 45, masterIds: ['master1', 'master3'], prices: { regular: 7000, top: 9000 } },
    { id: 'coloring', name: 'Сложное окрашивание Airtouch', category: 'Волосы', duration: 180, masterIds: ['master1', 'master3'], prices: { regular: 35000, top: 42000 } },
    { id: 'hair-care', name: 'Уход и восстановление волос', category: 'Волосы', duration: 90, masterIds: ['master1', 'master3'], prices: { regular: 18000, top: 22000 } },
    { id: 'manicure', name: 'Аппаратный маникюр с покрытием', category: 'Ногти', duration: 90, masterIds: ['master2', 'master4'], prices: { regular: 12000, top: 15000 } },
    { id: 'pedicure', name: 'Педикюр с уходом', category: 'Ногти', duration: 90, masterIds: ['master2', 'master4'], prices: { regular: 15000, top: 18000 } },
    { id: 'nail-design', name: 'Маникюр с укреплением и дизайном', category: 'Ногти', duration: 120, masterIds: ['master2', 'master4'], prices: { regular: 14000, top: 17000 } },
    { id: 'day-makeup', name: 'Дневной макияж', category: 'Макияж', duration: 60, masterIds: ['master5', 'master7'], prices: { regular: 12000, top: 15000 } },
    { id: 'evening-makeup', name: 'Вечерний макияж', category: 'Макияж', duration: 90, masterIds: ['master5', 'master7'], prices: { regular: 20000, top: 25000 } },
    { id: 'facial-care', name: 'Уходовая процедура для лица', category: 'Косметология', duration: 60, masterIds: ['master6', 'master8'], prices: { regular: 16000, top: 20000 } },
    { id: 'facial-cleanse', name: 'Очищение и уход за лицом', category: 'Косметология', duration: 90, masterIds: ['master6', 'master8'], prices: { regular: 20000, top: 25000 } },
    { id: 'brow-shaping', name: 'Коррекция и окрашивание бровей', category: 'Брови и ресницы', duration: 45, masterIds: ['master9', 'master10'], prices: { regular: 8000, top: 10000 } },
    { id: 'lash-lift', name: 'Ламинирование ресниц', category: 'Брови и ресницы', duration: 75, masterIds: ['master9', 'master10'], prices: { regular: 15000, top: 18000 } },
    { id: 'relax-massage', name: 'Расслабляющий массаж', category: 'SPA-уход', duration: 60, masterIds: ['master11', 'master12'], prices: { regular: 20000, top: 25000 } }
];

const MASTERS = [
    { id: 'master1', name: 'Арайлым', specialty: 'Волосы', level: 'regular', experience: 5, description: 'Стрижки, укладки и бережный уход за волосами.', serviceIds: ['haircut','men-haircut','coloring','hair-care'] },
    { id: 'master3', name: 'Айгерим', specialty: 'Волосы', level: 'top', experience: 4, description: 'Стрижки и сложные техники окрашивания.', serviceIds: ['haircut','men-haircut','coloring','hair-care'] },
    { id: 'master2', name: 'Аружан', specialty: 'Ногти', level: 'regular', experience: 4, description: 'Маникюр, педикюр и аккуратный повседневный дизайн.', serviceIds: ['manicure','pedicure','nail-design'] },
    { id: 'master4', name: 'Мадина', specialty: 'Ногти', level: 'top', experience: 3, description: 'Маникюр с укреплением, дизайном и комплексный уход.', serviceIds: ['manicure','pedicure','nail-design'] },
    { id: 'master5', name: 'Жанель', specialty: 'Макияж', level: 'regular', experience: 5, description: 'Дневной и вечерний макияж с подбором образа.', serviceIds: ['day-makeup','evening-makeup'] },
    { id: 'master7', name: 'Динара', specialty: 'Макияж', level: 'top', experience: 6, description: 'Макияж для особых событий и выразительных образов.', serviceIds: ['day-makeup','evening-makeup'] },
    { id: 'master6', name: 'Асем', specialty: 'Косметология', level: 'regular', experience: 6, description: 'Уходовые процедуры и очищение кожи лица.', serviceIds: ['facial-care','facial-cleanse'] },
    { id: 'master8', name: 'Лаура', specialty: 'Косметология', level: 'top', experience: 7, description: 'Комплексные программы ухода за кожей лица.', serviceIds: ['facial-care','facial-cleanse'] },
    { id: 'master9', name: 'Айсулу', specialty: 'Брови и ресницы', level: 'regular', experience: 3, description: 'Коррекция и окрашивание бровей, ламинирование ресниц.', serviceIds: ['brow-shaping','lash-lift'] },
    { id: 'master10', name: 'Томирис', specialty: 'Брови и ресницы', level: 'top', experience: 5, description: 'Архитектура бровей и выразительное ламинирование ресниц.', serviceIds: ['brow-shaping','lash-lift'] },
    { id: 'master11', name: 'Сауле', specialty: 'SPA-уход', level: 'regular', experience: 4, description: 'Расслабляющий массаж и бережный SPA-уход.', serviceIds: ['relax-massage'] },
    { id: 'master12', name: 'Жанар', specialty: 'SPA-уход', level: 'top', experience: 7, description: 'Расслабляющие массажные техники и комплексный уход.', serviceIds: ['relax-massage'] }
];

const money = value => Number(value).toLocaleString('ru-RU') + ' ₸';
function findService(id) { return SERVICES.find(item => item.id === id); }
function findMaster(id) { return MASTERS.find(item => item.id === id); }
function getMastersForService(id) { const service = findService(id); return service ? service.masterIds.map(findMaster).filter(Boolean) : []; }
function getServicePrice(service, master) { return service.prices[master && master.level === 'top' ? 'top' : 'regular']; }
function getTotal(cart) { return cart.reduce((sum, item) => { const service = findService(item.id); return sum + (service ? service.prices.regular * item.qty : 0); }, 0); }
function getCount(cart) { return cart.reduce((sum, item) => sum + item.qty, 0); }
function make(tag, className = '', content = '') { const node = document.createElement(tag); if (className) node.className = className; if (content !== '') node.textContent = content; return node; }
function getCart() { try { const cart = JSON.parse(sessionStorage.getItem('khadishaCart') || '[]'); return Array.isArray(cart) ? cart.filter(item => findService(item.id) && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 10) : []; } catch { return []; } }
function saveCart(cart) { sessionStorage.setItem('khadishaCart', JSON.stringify(cart)); window.dispatchEvent(new Event('cartchange')); }
function addToCart(id) { const cart = getCart(); const item = cart.find(row => row.id === id); if (item) item.qty = Math.min(10, item.qty + 1); else if (findService(id)) cart.push({ id, qty: 1 }); saveCart(cart); }
function fieldError(input, message) { const box = input.closest('p,div') || input.parentNode; let error = box.querySelector('.invalid-feedback'); if (!error) { error = make('div', 'invalid-feedback'); box.append(error); } error.textContent = message; input.classList.toggle('is-invalid', Boolean(message)); input.classList.toggle('is-valid', !message); return !message; }
function checkFields(rules) { let first = null; for (const [input, message] of rules) if (!fieldError(input, message) && !first) first = input; if (first) first.focus(); return !first; }

function setupCart() {
    const nav = document.querySelector('.site-nav .nav'); if (!nav) return;
    const item=make('li','nav-item'); const button = make('button', 'btn btn-outline-primary btn-sm', 'Корзина (0)'); button.type = 'button'; button.setAttribute('aria-expanded','false'); item.append(button); nav.append(item);
    const panel = make('section','container my-2 p-3 border rounded bg-white shadow-sm d-none'); panel.setAttribute('aria-label','Корзина услуг'); panel.setAttribute('aria-live','polite');
    const heading = make('h2','h5','Корзина услуг'); const lines = make('div'); const summary = make('p','fw-bold mt-3 mb-2'); const note = make('p','small text-muted','Прайс ориентировочный. Запись и оплата здесь не оформляются.'); const controls = make('div','d-flex flex-wrap gap-2');
    const clear = make('button','btn btn-outline-secondary btn-sm','Очистить корзину'); clear.type = 'button'; const go = make('a','btn btn-primary btn-sm','Записаться на услугу'); controls.append(clear,go); panel.append(heading,lines,summary,note,controls);
    const header = document.querySelector('header'); if (header) header.after(panel); else document.body.prepend(panel);
    function change(id, amount) { const cart = getCart(); const item = cart.find(row => row.id === id); if (!item) return; item.qty += amount; saveCart(cart.filter(row => row.qty > 0)); }
    function render() {
        const cart = getCart(); button.textContent = 'Корзина (' + getCount(cart) + ')'; lines.replaceChildren();
        if (!cart.length) { lines.append(make('p','text-muted mb-2','Корзина пока пуста. Добавьте услуги из каталога.')); go.classList.add('disabled'); go.removeAttribute('href'); }
        cart.forEach(item => { const service = findService(item.id); const row = make('div','d-flex flex-wrap gap-2 align-items-center justify-content-between border-bottom py-2'); const label = make('div','flex-grow-1',service.name + ' · от ' + money(service.prices.regular)); const controls = make('div','d-flex align-items-center gap-2'); const minus = make('button','btn btn-sm btn-outline-secondary','−'); minus.type='button'; minus.setAttribute('aria-label','Уменьшить количество'); minus.addEventListener('click',()=>change(item.id,-1)); const quantity=make('span','',String(item.qty)); const plus=make('button','btn btn-sm btn-outline-secondary','+'); plus.type='button'; plus.disabled=item.qty>=10; plus.setAttribute('aria-label','Увеличить количество'); plus.addEventListener('click',()=>change(item.id,1)); const remove=make('button','btn btn-sm btn-outline-danger','Удалить'); remove.type='button'; remove.addEventListener('click',()=>saveCart(getCart().filter(row=>row.id!==item.id))); controls.append(minus,quantity,plus,remove); row.append(label,controls); lines.append(row); });
        summary.textContent = cart.length ? 'Итого по базовому тарифу: ' + money(getTotal(cart)) + ' · ' + getCount(cart) + ' услуг' : '';
        clear.disabled = !cart.length; if (cart.length) { go.href='booking.html?service='+encodeURIComponent(cart[0].id); go.classList.remove('disabled'); }
    }
    button.addEventListener('click',()=>{const open=panel.classList.contains('d-none');panel.classList.toggle('d-none');button.setAttribute('aria-expanded',String(open));if(open)panel.scrollIntoView({behavior:'smooth',block:'nearest'});});
    clear.addEventListener('click',()=>saveCart([])); window.addEventListener('cartchange',render); render();
}

function setupAccount() {
    const nav=document.querySelector('.site-nav .nav'); if(!nav)return;
    const item=make('li','nav-item'); const button=make('button','btn btn-outline-primary btn-sm','Войти / Регистрация'); button.type='button'; button.setAttribute('aria-expanded','false'); item.append(button); nav.append(item);
    const panel=make('section','container my-2 p-3 border rounded bg-white shadow-sm d-none'); panel.setAttribute('aria-label','Вход и регистрация');
    const title=make('h2','h5','Вход'); const tabs=make('div','d-flex gap-2 mb-3'); const login=make('button','btn btn-primary btn-sm','Вход'); const signup=make('button','btn btn-outline-primary btn-sm','Регистрация'); login.type=signup.type='button'; tabs.append(login,signup);
    const form=make('form','row g-2'); form.noValidate=true; const status=make('p','small mt-2 mb-0'); status.setAttribute('role','status'); const fields={};
    for(const [key,label,type] of [['name','Имя','text'],['email','Email','email'],['password','Пароль','password'],['confirm','Повторите пароль','password']]){const col=make('div','col-12 col-md-6');const input=make('input','form-control');input.id='account-'+key;input.type=type;input.autocomplete=key==='password'?'current-password':key==='confirm'?'new-password':key==='email'?'email':'name';const text=make('label','form-label',label);text.htmlFor=input.id;col.append(text,input);form.append(col);fields[key]={col,input};}
    const submit=make('button','btn btn-primary','Войти'); submit.type='submit'; const help=make('p','col-12 small text-muted mb-0','Демонстрационная форма: сайт не создаёт аккаунт и не сохраняет пароль.'); form.append(make('div','col-12', '')); form.append(submit); panel.append(title,tabs,form,help,status);
    const header=document.querySelector('header'); if(header)header.after(panel); else document.body.prepend(panel);
    let mode='login'; function setMode(next){mode=next;title.textContent=mode==='login'?'Вход':'Регистрация';submit.textContent=mode==='login'?'Войти':'Зарегистрироваться';fields.name.col.classList.toggle('d-none',mode==='login');fields.confirm.col.classList.toggle('d-none',mode==='login');fields.password.input.autocomplete=mode==='login'?'current-password':'new-password';login.className='btn btn-sm '+(mode==='login'?'btn-primary':'btn-outline-primary');signup.className='btn btn-sm '+(mode==='signup'?'btn-primary':'btn-outline-primary');status.textContent='';}
    button.addEventListener('click',()=>{const open=panel.classList.contains('d-none');panel.classList.toggle('d-none');button.setAttribute('aria-expanded',String(open));if(open)fields.email.input.focus();}); login.addEventListener('click',()=>setMode('login')); signup.addEventListener('click',()=>setMode('signup'));
    form.addEventListener('submit',event=>{event.preventDefault();const rules=[];if(mode==='signup')rules.push([fields.name.input,fields.name.input.value.trim().length>=2?'':'Введите имя (минимум 2 символа)']);rules.push([fields.email.input,/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.input.value.trim())?'':'Введите корректный email']);const password=fields.password.input.value;if(mode==='signup'){rules.push([fields.password.input,password.length>=8?'':'Пароль должен содержать не менее 8 символов']);rules.push([fields.confirm.input,fields.confirm.input.value===password?'':'Пароли не совпадают']);}else rules.push([fields.password.input,password?'':'Введите пароль']);if(!checkFields(rules)){status.textContent='Проверьте поля формы.';status.className='small text-danger mt-2 mb-0';return;}status.textContent=mode==='login'?'Форма заполнена. Настоящий вход требует подключения сервера.':'Форма заполнена. Регистрация требует подключения сервера; пароль не сохранён.';status.className='small text-success mt-2 mb-0';}); setMode('login');
}

document.addEventListener('DOMContentLoaded',()=>{setupCart();setupAccount();});
