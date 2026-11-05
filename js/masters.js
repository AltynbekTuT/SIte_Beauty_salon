'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('main > section');
    const grid = section ? section.querySelector('.row') : null;
    if (!section || !grid) return;

    function matchesMaster(master, query, specialty) {
        const text = (master.name + ' ' + master.specialty + ' ' + master.description).toLocaleLowerCase('ru');
        return (specialty === 'Все направления' || master.specialty === specialty) && text.includes(query);
    }

    const controls = document.createElement('div');
    controls.className = 'row g-2 mb-3';
    const searchColumn = document.createElement('div');
    searchColumn.className = 'col-12 col-md-5';
    const search = document.createElement('input');
    search.className = 'form-control';
    search.type = 'search';
    search.placeholder = 'Поиск по имени или специализации';
    search.setAttribute('aria-label', 'Поиск мастера по имени или специализации');
    searchColumn.append(search);

    const selectColumn = document.createElement('div');
    selectColumn.className = 'col-12 col-md-4';
    const select = document.createElement('select');
    select.className = 'form-select';
    select.setAttribute('aria-label', 'Фильтр мастеров по направлению');
    for (const value of ['Все направления', ...new Set(MASTERS.map(master => master.specialty))]) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.append(option);
    }
    selectColumn.append(select);

    const resetColumn = document.createElement('div');
    resetColumn.className = 'col-12 col-md-3';
    const reset = document.createElement('button');
    reset.className = 'btn btn-outline-secondary w-100';
    reset.type = 'button';
    reset.textContent = 'Сбросить';
    resetColumn.append(reset);
    controls.append(searchColumn, selectColumn, resetColumn);

    const count = document.createElement('p');
    count.className = 'small text-muted';
    count.setAttribute('aria-live', 'polite');
    section.querySelector('h2').after(controls, count);

    const cards = new Map();
    for (const master of MASTERS) {
        const article = document.getElementById(master.id);
        if (!article) continue;
        article.dataset.masterId = master.id;
        cards.set(master.id, article);
        const masterPhotos = {
            master1:['photo-1703792686658-24e62d626ed2','hair-stylist'],master3:['photo-1560869713-7d0a29430803','hair-stylist'],
            master2:['photo-1632345031435-8727f6897d53','nail-salon'],master4:['photo-1610992015732-2449b76344bc','nail-salon'],
            master5:['photo-1692856184951-8e06bba6b4b5','makeup'],master7:['photo-1512496015851-a90fb38ba796','makeup'],
            master6:['photo-1706795034830-de41aee06afa','facial-treatment'],master8:['photo-1512290923902-8a9f81dc236c','facial-treatment'],
            master9:['photo-1524250502761-1ac6f2e30d43','beauty'],master10:['photo-1529139574466-a303027c1d8b','beauty'],
            master11:['photo-1506126613408-eca07ce68773','spa'],master12:['photo-1544161515-4ab6ce6db874','spa']
        };
        const selected = masterPhotos[master.id];
        const photo = selected ? {src:'https://images.unsplash.com/'+selected[0]+'?auto=format&fit=crop&fm=jpg&q=85&w=900',alt:'Иллюстрация направления «'+master.specialty+'»',url:'https://unsplash.com/s/photos/'+selected[1]} : null;
        const cardBody = article.querySelector('.review-card');
        if (photo && cardBody && !cardBody.querySelector('.master-photo-figure')) {
            const figure = document.createElement('figure');
            figure.className = 'master-photo-figure mb-3';
            const image = document.createElement('img');
            image.className = 'master-photo'; image.src = photo.src; image.alt = photo.alt; image.loading = 'lazy';
            const caption = document.createElement('figcaption'); caption.className = 'photo-credit mt-1';
            const credit = document.createElement('a'); credit.href = photo.url; credit.target = '_blank'; credit.rel = 'noopener noreferrer';
            caption.append(credit); figure.append(image, caption); cardBody.prepend(figure);
        }
        let action = article.querySelector('a.btn');
        if (!action) {
            action = document.createElement('a');
            action.className = 'btn btn-outline-primary';
            action.textContent = 'Перейти к записи';
            article.append(action);
        }
        action.href = 'booking.html?master=' + encodeURIComponent(master.id);
    }

    function renderMasters() {
        const query = search.value.trim().toLocaleLowerCase('ru');
        const matches = MASTERS.filter(master => matchesMaster(master, query, select.value));
        const visibleIds = new Set(matches.map(master => master.id));
        for (const master of MASTERS) {
            const card = cards.get(master.id);
            if (card) card.classList.toggle('d-none', !visibleIds.has(master.id));
        }
        count.textContent = matches.length ? 'Найдено мастеров: ' + matches.length : 'По вашему запросу мастеров не найдено.';
    }

    search.addEventListener('input', renderMasters);
    select.addEventListener('change', renderMasters);
    reset.addEventListener('click', () => {
        search.value = '';
        select.value = 'Все направления';
        renderMasters();
        search.focus();
    });
    renderMasters();
});



