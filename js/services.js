'use strict';

// jQuery 3.7.1: используем полную сборку, потому что заданию нужны эффекты slideToggle/fadeIn.
$(function () {
    const $table = $('#services-table');
    if (!$table.length) return;

    const $tbody = $table.find('tbody');
    const $section = $table.closest('section');
    const $heading = $section.find('h2').first();

    // Переписанная функция №1: DOMContentLoaded/querySelector/createElement/append и addEventListener
    // заменены на ready, $(), .append(), .text() и .on(). Код не стал короче, но цепочки создания строк видны явно.
    const $toggle = $('<button>')
        .attr({ type: 'button', 'aria-expanded': 'true' })
        .addClass('btn btn-outline-primary mb-2')
        .text('Скрыть фильтры');
    const $filterPanel = $('<div>').addClass('row g-2 mb-3 service-filters');
    const $searchColumn = $('<div>').addClass('col-12 col-md-5');
    const $search = $('<input>')
        .attr({ type: 'search', placeholder: 'Например, маникюр или окрашивание', 'aria-label': 'Поиск услуги' })
        .addClass('form-control');
    const $categoryColumn = $('<div>').addClass('col-12 col-md-4');
    const $category = $('<select>').attr('aria-label', 'Фильтр по категории').addClass('form-select');
    const $resetColumn = $('<div>').addClass('col-12 col-md-3');
    const $reset = $('<button>').attr('type', 'button').addClass('btn btn-outline-secondary w-100').text('Сбросить');
    const $count = $('<p>').addClass('small text-muted mb-2').attr('aria-live', 'polite');

    $category.append($('<option>').val('').text('Все категории'));
    $.each([...new Set(SERVICES.map(service => service.category))], function (_index, label) {
        $category.append($('<option>').val(label).text(label));
    });
    $searchColumn.append($search);
    $categoryColumn.append($category);
    $resetColumn.append($reset);
    $filterPanel.append($searchColumn, $categoryColumn, $resetColumn);
    $heading.after($toggle, $filterPanel, $count);

    function renderServices() {
        const query = String($search.val() || '').trim().toLocaleLowerCase('ru');
        const selectedCategory = String($category.val() || '');
        const filtered = SERVICES.filter(service =>
            (!selectedCategory || service.category === selectedCategory) &&
            service.name.toLocaleLowerCase('ru').includes(query)
        );
        $tbody.empty();
        $count.text('Найдено услуг: ' + filtered.length);

        if (!filtered.length) {
            // Здесь .html() получает только статическую разметку автора, а не пользовательский ввод.
            $tbody.html('<tr><td colspan="6" class="text-center py-4">Ничего не найдено. Попробуйте изменить запрос.</td></tr>');
            return;
        }

        $.each(filtered, function (index, service) {
            const $row = $('<tr>').attr('data-service-id', service.id);
            const previous = filtered[index - 1];
            if (!previous || previous.category !== service.category) {
                let span = 1;
                for (let next = index + 1; next < filtered.length && filtered[next].category === service.category; next += 1) span += 1;
                $row.append($('<th>').attr({ scope: 'rowgroup', rowspan: span }).addClass('align-middle').text(service.category));
            }

            // Цепочка: создаёт ячейку, добавляет Bootstrap-классы, задаёт безопасный текст и помещает её в строку.
            $('<td>').addClass('align-middle service-name').text(service.name).appendTo($row);
            $('<td>').addClass('align-middle').text(service.duration + ' мин').appendTo($row);
            $('<td>').addClass('align-middle text-nowrap').text(money(service.prices.regular)).appendTo($row);
            $('<td>').addClass('align-middle text-nowrap').text(money(service.prices.top)).appendTo($row);

            const $actions = $('<td>').addClass('align-middle text-nowrap');
            const $add = $('<button>')
                .attr({ type: 'button', 'data-action': 'cart', 'data-service-id': service.id, 'aria-label': 'Добавить услугу в корзину: ' + service.name })
                .addClass('btn btn-sm btn-outline-primary')
                .text('В корзину');
            const $book = $('<a>')
                .attr('href', 'booking.html?service=' + encodeURIComponent(service.id))
                .addClass('btn btn-sm btn-primary ms-1')
                .text('Записаться');
            $actions.append($add, $book);
            $row.append($actions);
            $tbody.append($row);
        });

        // .each() проходит по готовым строкам и добавляет им последовательный индекс для доступности.
        $tbody.find('tr').each(function (index) {
            $(this).attr('aria-rowindex', String(index + 1));
        });
    }

    // Делегирование: строки и кнопки строятся позже; обработчик на tbody поймает клики по новым кнопкам.
    // Прямая привязка к кнопкам до построения строк не нашла бы ещё не существующие элементы.
    $tbody.on('click', '[data-action="cart"]', function () {
        const $button = $(this);
        const $row = $button.closest('tr');
        const serviceId = $button.attr('data-service-id');
        const serviceName = $row.find('.service-name').text();
        if (!serviceId || !serviceName) return;
        addToCart(serviceId);
        $button.text('Добавлено ✓');
        window.setTimeout(() => $button.text('В корзину'), 1000);
    });

    $toggle.on('click', function () {
        const $button = $(this);
        const opening = !$button.hasClass('active');
        $button.toggleClass('active').attr('aria-expanded', String(opening));
        // .siblings() находит панель фильтров рядом с кнопкой; slideToggle экономит место по запросу посетителя.
        $button.siblings('.service-filters').stop(true, true).slideToggle(250, function () {
            $button.text(opening ? 'Скрыть фильтры' : 'Показать фильтры');
        });
    });
    $search.on('input', renderServices);
    $category.on('change', renderServices);
    $reset.on('click', function () {
        $search.val('');
        $category.val('');
        renderServices();
        $search.trigger('focus');
    });

    renderServices();
});
