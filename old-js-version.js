/*
  jQuery 3.7.1 comparison archive.
  This file is intentionally not linked from any HTML page.
*/

/* Original plain-JavaScript version: services.js */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('#services-table tbody');
    if (!table) return;
    const section = table.closest('section');
    const filters = make('div','row g-2 mb-3');
    const searchCol = make('div','col-12 col-md-5');
    const search = make('input','form-control'); search.type='search'; search.placeholder='Например, маникюр или окрашивание'; search.setAttribute('aria-label','Поиск услуги'); searchCol.append(search);
    const categoryCol = make('div','col-12 col-md-4');
    const category = make('select','form-select'); category.setAttribute('aria-label','Фильтр по категории');
    [['','Все категории'],...Array.from(new Set(SERVICES.map(item=>item.category)), value=>[value,value])].forEach(([value,label])=>{const option=make('option','',label);option.value=value;category.append(option);}); categoryCol.append(category);
    const resetCol = make('div','col-12 col-md-3'); const reset=make('button','btn btn-outline-secondary w-100','Сбросить');reset.type='button';resetCol.append(reset);filters.append(searchCol,categoryCol,resetCol);
    const count=make('p','small text-muted mb-2');count.setAttribute('aria-live','polite');section.querySelector('h2').after(filters,count);

    function render(){
        const query=search.value.trim().toLocaleLowerCase('ru');
        const filtered=SERVICES.filter(item=>(!category.value||item.category===category.value)&&item.name.toLocaleLowerCase('ru').includes(query));
        table.replaceChildren();count.textContent='Найдено услуг: '+filtered.length;
        if(!filtered.length){const row=make('tr');const cell=make('td','text-center py-4','Ничего не найдено. Попробуйте изменить запрос.');cell.colSpan=6;row.append(cell);table.append(row);return;}
        filtered.forEach((service,index)=>{
            const row=make('tr');
            const previous=filtered[index-1];if(!previous||previous.category!==service.category){let span=1;for(let next=index+1;next<filtered.length&&filtered[next].category===service.category;next++)span++;const cell=make('th','align-middle',service.category);cell.scope='rowgroup';cell.rowSpan=span;row.append(cell);}
            row.append(make('td','align-middle',service.name),make('td','align-middle',service.duration+' мин'),make('td','align-middle text-nowrap',money(service.prices.regular)),make('td','align-middle text-nowrap',money(service.prices.top)));
            const action=make('td','align-middle text-nowrap');const add=make('button','btn btn-sm btn-outline-primary','В корзину');add.type='button';add.addEventListener('click',()=>{addToCart(service.id);add.textContent='Добавлено ✓';window.setTimeout(()=>{add.textContent='В корзину';},1000);});const book=make('a','btn btn-sm btn-primary ms-1','Записаться');book.href='booking.html?service='+encodeURIComponent(service.id);action.append(add,book);row.append(action);table.append(row);
        });
    }
    search.addEventListener('input',render);category.addEventListener('change',render);reset.addEventListener('click',()=>{search.value='';category.value='';render();search.focus();});render();
});


/* Original plain-JavaScript version: booking.js */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const form=document.getElementById('booking-form'); if(!form)return;
    const serviceSelect=document.getElementById('service-select'); const masterSelect=document.getElementById('master-select');
    const date=document.getElementById('booking-date'); const time=document.getElementById('booking-time'); const guests=document.getElementById('guest-count');
    const total=document.getElementById('booking-total'); const confirmation=document.getElementById('booking-confirmation'); const errors=document.getElementById('booking-errors');
    const chosenMasterNote=make('div','small text-muted mt-1'); masterSelect.after(chosenMasterNote);
    const selectedServiceNote=make('div','small text-muted mt-1'); serviceSelect.after(selectedServiceNote);
    serviceSelect.replaceChildren();const placeholder=make('option','','Сначала выберите услугу');placeholder.value='';serviceSelect.append(placeholder);
    for(const category of [...new Set(SERVICES.map(item=>item.category))]){const group=document.createElement('optgroup');group.label=category;for(const service of SERVICES.filter(item=>item.category===category)){const option=make('option','',service.name+' · от '+money(service.prices.regular));option.value=service.id;group.append(option);}serviceSelect.append(group);}
    const params=new URLSearchParams(window.location.search);const requestedService=params.get('service');let requestedMaster=params.get('master');
    if(findService(requestedService))serviceSelect.value=requestedService;else if(findMaster(requestedMaster)&&findMaster(requestedMaster).serviceIds.length)serviceSelect.value=findMaster(requestedMaster).serviceIds[0];else if(getCart().length)serviceSelect.value=getCart()[0].id;
    date.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    function update(){
        const service=findService(serviceSelect.value);const available=getMastersForService(serviceSelect.value);const previous=masterSelect.value;
        masterSelect.replaceChildren();const prompt=make('option','','Выберите мастера');prompt.value='';masterSelect.append(prompt);
        for(const master of available){const tier=master.level==='top'?'Топ-мастер':'Мастер';const option=make('option','',master.name+' · '+tier+' · '+money(getServicePrice(service,master)));option.value=master.id;masterSelect.append(option);}
        if(available.some(master=>master.id===previous))masterSelect.value=previous;else if(available.some(master=>master.id===requestedMaster))masterSelect.value=requestedMaster;
        selectedServiceNote.textContent=service?'Длительность: около '+service.duration+' мин.':'Выберите процедуру, чтобы увидеть подходящих специалистов и стоимость.';
        const master=findMaster(masterSelect.value);chosenMasterNote.textContent=master&&service?'Стоимость: '+money(getServicePrice(service,master))+' за одного человека.':'';
        if(service&&master){const amount=Math.max(1,Math.min(5,Number(guests.value)||1));total.textContent=service.name+' · '+master.name+' ('+(master.level==='top'?'топ-мастер':'мастер')+'): '+money(getServicePrice(service,master)*amount)+(amount>1?' за '+amount+' человек':'')+'. Продолжительность — около '+service.duration+' мин.';}
        else total.textContent=service?'Для этой услуги есть два специалиста: обычный мастер и топ-мастер. Выберите подходящий тариф.':'Выберите услугу и мастера — здесь появятся длительность и стоимость.';
    }
    serviceSelect.addEventListener('change',()=>{requestedMaster='';update();});masterSelect.addEventListener('change',update);guests.addEventListener('input',update);
    form.noValidate=true;
    form.addEventListener('submit',event=>{
        event.preventDefault();confirmation.textContent='';const name=document.getElementById('client-name');const email=document.getElementById('client-email');const phone=document.getElementById('client-phone');const policy=form.querySelector('[name="policy_agreement"]');
        const today=new Date();today.setHours(0,0,0,0);const selectedDate=date.value?new Date(date.value+'T00:00:00'):null;const selectedDateTime=date.value&&time.value?new Date(date.value+'T'+time.value):null;const hour=time.value?Number(time.value.split(':')[0]):NaN;const service=findService(serviceSelect.value);const master=findMaster(masterSelect.value);const qty=Number(guests.value);
        const rules=[[name,name.value.trim().length>=2?'':'Укажите имя (не менее двух символов)'],[email,/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())?'':'Введите правильный email'],[phone,/^\+?\d{10,15}$/.test(phone.value.replace(/[\s()\-]/g,''))?'':'Введите телефон: 10–15 цифр'],[serviceSelect,service?'':'Выберите услугу'],[masterSelect,service&&master&&service.masterIds.includes(master.id)?'':'Выберите одного из предложенных мастеров'],[date,selectedDate&&selectedDate>=today?'':'Выберите сегодняшнюю или будущую дату'],[time,hour>=10&&hour<20&&selectedDateTime>new Date()?'':'Выберите время с 10:00 до 19:59, не раньше текущего времени'],[guests,Number.isInteger(qty)&&qty>=1&&qty<=5?'':'Укажите от 1 до 5 человек'],[policy,policy.checked?'':'Подтвердите ознакомление с правилами посещения']];
        if(!checkFields(rules)){errors.textContent='Проверьте поля, отмеченные в форме.';errors.className='text-danger mt-2';return;}
        confirmation.textContent='Заявка подготовлена для '+name.value.trim()+': '+service.name+', '+master.name+', '+date.value+' в '+time.value+'. Ориентировочная стоимость: '+money(getServicePrice(service,master)*qty)+'. Это демо: заявка не отправлена и запись не подтверждена. Администратор согласует время.';confirmation.className='alert alert-success mt-3';errors.textContent='';confirmation.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    form.addEventListener('reset',()=>setTimeout(()=>{masterSelect.value='';errors.textContent='';confirmation.textContent='Заявка будет подтверждена администратором после согласования времени.';form.querySelectorAll('.is-invalid,.is-valid').forEach(el=>el.classList.remove('is-invalid','is-valid'));update();},0));
    update();
});



/* Original plain-JavaScript version: reviews.js */
'use strict';

document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('review-form');if(!form)return;
    const usedService=document.getElementById('used-service');usedService.replaceChildren();const prompt=make('option','','Выберите услугу');prompt.value='';usedService.append(prompt);
    for(const category of [...new Set(SERVICES.map(item=>item.category))]){const group=document.createElement('optgroup');group.label=category;for(const service of SERVICES.filter(item=>item.category===category)){const option=make('option','',service.name);option.value=service.id;group.append(option);}usedService.append(group);}
    const text=document.getElementById('review-text');const counter=make('p','small text-muted','0 / 500 символов (минимум 10)');text.maxLength=500;text.after(counter);const cards=document.getElementById('review-cards');
    const reviewPhotos=[{id:'photo-1521590832167-7bcbfaa6381f',topic:'hair-stylist',alt:'Работа парикмахера с волосами'},{id:'photo-1519014816548-bf5fe059798b',topic:'nail-salon',alt:'Маникюр и уход за ногтями'},{id:'photo-1516975080664-ed2fc6a32937',topic:'makeup',alt:'Косметика и инструменты для макияжа'}];
    const reviews=[{name:'Сания А.',serviceId:'coloring',rating:5,text:'Очень довольна результатом! Мастер внимательно подобрала оттенок, волосы выглядят ухоженными и живыми.',date:'9 октября 2026'},{name:'Алия М.',serviceId:'manicure',rating:5,text:'Спасибо за аккуратную работу и приятную атмосферу. Помогли подобрать форму и цвет покрытия.',date:'9 октября 2026'},{name:'Дана К.',serviceId:'haircut',rating:5,text:'Мастер выслушала пожелания, подсказала, как укладывать волосы дома. Результат получился именно таким, как я хотела.',date:'9 октября 2026'}];
    function reviewCard(review,index){const service=findService(review.serviceId);const photo=reviewPhotos[index%reviewPhotos.length];const col=make('article','col-12 col-md-6 col-lg-4');const card=make('div','review-card h-100 overflow-hidden');const figure=make('figure','review-figure mb-0');const image=make('img','review-photo');image.src='https://images.unsplash.com/'+photo.id+'?auto=format&fit=crop&fm=jpg&q=85&w=900';image.alt=photo.alt;image.loading='lazy';const caption=make('figcaption','photo-credit px-3 pt-2','Иллюстрация: ');const credit=document.createElement('a');credit.href='https://unsplash.com/s/photos/'+photo.topic;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='Unsplash';caption.append(credit);figure.append(image,caption);const body=make('div','p-3');body.append(make('h3','h5',review.name),make('p','small text-muted mb-2',(service?service.name:'Услуга')+' · '+review.rating+' из 5 · '+review.date),make('p','mb-0',review.text));col.append(card);card.append(figure,body);return col;}
    function render(){cards.replaceChildren();reviews.forEach((review,index)=>cards.append(reviewCard(review,index)));}
    text.addEventListener('input',()=>{counter.textContent=text.value.length+' / 500 символов (минимум 10)';});form.noValidate=true;
    form.addEventListener('submit',event=>{event.preventDefault();const name=document.getElementById('author-name'),email=document.getElementById('author-email'),phone=document.getElementById('author-phone'),date=document.getElementById('visit-date'),rating=document.getElementById('service-rating'),permission=form.querySelector('[name="publish_permission"]');const today=new Date();today.setHours(0,0,0,0);const visit=date.value?new Date(date.value+'T00:00:00'):null;const rules=[[name,name.value.trim().length>=2?'':'Введите имя (минимум 2 символа)'],[email,/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())?'':'Введите корректный email'],[phone,/^\+?\d{10,15}$/.test(phone.value.replace(/[\s()\-]/g,''))?'':'Введите корректный номер'],[date,visit&&visit<=today?'':'Укажите дату визита не в будущем'],[usedService,findService(usedService.value)?'':'Выберите услугу'],[rating,Number.isInteger(Number(rating.value))&&Number(rating.value)>=1&&Number(rating.value)<=5?'':'Оценка от 1 до 5'],[text,text.value.trim().length>=10&&text.value.length<=500?'':'От 10 до 500 символов'],[permission,permission.checked?'':'Разрешите публикацию']];const feedback=document.getElementById('review-confirmation');if(!checkFields(rules)){feedback.textContent='Исправьте ошибки рядом с полями.';feedback.className='text-danger';return;}reviews.unshift({name:name.value.trim(),serviceId:usedService.value,rating:Number(rating.value),text:text.value.trim(),date:new Date().toLocaleDateString('ru-RU')});render();feedback.textContent='Отзыв добавлен на эту страницу (демо). Он не отправлен на сервер и исчезнет после обновления.';feedback.className='alert alert-success';form.reset();counter.textContent='0 / 500 символов (минимум 10)';cards.scrollIntoView({behavior:'smooth',block:'nearest'});});render();
});
