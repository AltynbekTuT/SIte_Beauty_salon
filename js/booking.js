'use strict';

// jQuery 3.7.1: полная версия включает эффекты, которые используются для ошибок и подтверждения.
$(function () {
    const $form = $('#booking-form');
    if (!$form.length) return;

    const $service = $('#service-select');
    const $master = $('#master-select');
    const $date = $('#booking-date');
    const $time = $('#booking-time');
    const $guests = $('#guest-count');
    const $total = $('#booking-total');
    const $confirmation = $('#booking-confirmation');
    const $errors = $('#booking-errors');
    const $name = $('#client-name');
    const $email = $('#client-email');
    const $phone = $('#client-phone');
    const $policy = $('[name="policy_agreement"]');
    let requestedMaster = '';

    // Переписанная функция №2: getElementById, createElement, classList и addEventListener заменены
    // на jQuery-выборки, .append(), .val() и .on(). Код не стал короче, зато отдельная проверка каждого поля читается яснее.
    const $serviceNote = $('<small>').addClass('form-text text-muted d-block mt-1').insertAfter($service);
    const $masterNote = $('<small>').addClass('form-text text-muted d-block mt-1').insertAfter($master);
    const categories = [...new Set(SERVICES.map(item => item.category))];
    $service.empty().append($('<option>').val('').text('Сначала выберите услугу'));
    $.each(categories, function (_i, category) {
        const $group = $('<optgroup>').attr('label', category);
        $.each(SERVICES.filter(item => item.category === category), function (_j, item) {
            $group.append($('<option>').val(item.id).text(item.name + ' · от ' + money(item.prices.regular)));
        });
        $service.append($group);
    });

    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get('service');
    requestedMaster = params.get('master') || '';
    if (findService(requestedService)) {
        $service.val(requestedService);
    } else if (findMaster(requestedMaster) && findMaster(requestedMaster).serviceIds.length) {
        $service.val(findMaster(requestedMaster).serviceIds[0]);
    } else if (getCart().length) {
        $service.val(getCart()[0].id);
    }

    function localDate() {
        return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    $date.attr('min', localDate());

    function updateSelection() {
        const currentService = findService($service.val());
        const oldMasterId = $master.val();
        const availableMasters = getMastersForService($service.val());
        $master.empty().append($('<option>').val('').text('Выберите мастера'));
        $.each(availableMasters, function (_index, person) {
            const role = person.level === 'top' ? 'Топ-мастер' : 'Мастер';
            $master.append($('<option>').val(person.id).text(person.name + ' · ' + role + ' · ' + money(getServicePrice(currentService, person))));
        });
        if (availableMasters.some(person => person.id === oldMasterId)) {
            $master.val(oldMasterId);
        } else if (availableMasters.some(person => person.id === requestedMaster)) {
            $master.val(requestedMaster);
        }

        $serviceNote.text(currentService ? 'Длительность: около ' + currentService.duration + ' мин.' : 'Выберите процедуру, чтобы увидеть специалистов и стоимость.');
        const selectedMaster = findMaster($master.val());
        $masterNote.text(selectedMaster && currentService ? 'Стоимость: ' + money(getServicePrice(currentService, selectedMaster)) + ' за одного человека.' : '');
        if (currentService && selectedMaster) {
            const quantity = Math.max(1, Math.min(5, Number($guests.val()) || 1));
            $total.text(currentService.name + ' · ' + selectedMaster.name + ': ' + money(getServicePrice(currentService, selectedMaster) * quantity) +
                (quantity > 1 ? ' за ' + quantity + ' человек' : '') + '. Продолжительность — около ' + currentService.duration + ' мин.');
        } else {
            $total.text(currentService ? 'Для услуги доступны обычный мастер и топ-мастер. Выберите специалиста и тариф.' :
                'Выберите услугу и мастера — здесь появятся длительность и стоимость.');
        }
    }

    function errorFor($field) {
        const value = String($field.val() || '').trim();
        const id = $field.attr('id');
        if (id === 'client-name' && value.length < 2) return 'Укажите имя (не менее двух символов).';
        if (id === 'client-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Введите правильный email.';
        if (id === 'client-phone' && !/^\+?\d{10,15}$/.test(value.replace(/[\s()\-]/g, ''))) return 'Введите телефон: от 10 до 15 цифр.';
        if (id === 'service-select' && !findService(value)) return 'Выберите услугу.';
        if (id === 'master-select') {
            const currentService = findService($service.val());
            const person = findMaster(value);
            if (!currentService || !person || !currentService.masterIds.includes(person.id)) return 'Выберите мастера из предложенного списка.';
        }
        if (id === 'booking-date' && (!value || value < localDate())) return 'Выберите сегодняшнюю или будущую дату.';
        if (id === 'booking-time') {
            const selectedDate = String($date.val() || '');
            const hour = Number(value.split(':')[0]);
            const selectedDateTime = selectedDate && value ? new Date(selectedDate + 'T' + value) : null;
            if (!selectedDateTime || hour < 10 || hour >= 20 || selectedDateTime <= new Date()) return 'Выберите время с 10:00 до 19:59, не раньше текущего времени.';
        }
        if (id === 'guest-count') {
            const quantity = Number(value);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) return 'Укажите от 1 до 5 человек.';
        }
        if ($field.is('[name="policy_agreement"]') && !$form.find('[name="policy_agreement"]:checked').length) return 'Подтвердите ознакомление с правилами посещения.';
        return '';
    }

    function showFieldResult($field, message) {
        const $group = $field.parent();
        let $feedback = $group.children('.invalid-feedback').first();
        if (!$feedback.length) $feedback = $('<div>').addClass('invalid-feedback').appendTo($group);
        if (message) {
            $field.addClass('is-invalid').removeClass('is-valid');
            $feedback.text(message);
        } else {
            $field.removeClass('is-invalid').addClass('is-valid');
            $feedback.text('');
        }
        $feedback.toggleClass('d-block', Boolean(message));
        return !message;
    }

    // required/type/min/max остаются в HTML. noValidate включает собственные сообщения рядом со всеми ошибочными полями;
    // если JavaScript отключён, браузер снова применяет свои стандартные ограничения.
    $form.prop('noValidate', true);
    $errors.hide();
    $form.on('change', '#service-select', function () {
        requestedMaster = '';
        updateSelection();
        showFieldResult($(this), errorFor($(this)));
        $master.removeClass('is-invalid is-valid').parent().children('.invalid-feedback').text('');
    });
    $form.on('change', '#master-select', function () {
        updateSelection();
        showFieldResult($(this), errorFor($(this)));
    });
    $form.on('input change', 'input, select, textarea', function () {
        const $field = $(this);
        if ($field.is('#service-select, #master-select')) return;
        showFieldResult($field, errorFor($field));
        if ($field.is('#booking-date, #booking-time, #guest-count')) updateSelection();
    });

    $form.on('submit', function (event) {
        // Без preventDefault браузер попробовал бы отправить форму и перезагрузил страницу: серверной записи здесь нет.
        // Эти клиентские проверки помогают посетителю, но не заменяют серверную проверку, когда появится backend.
        event.preventDefault();
        const $fields = $form.find('#client-name, #client-email, #client-phone, #booking-date, #booking-time, #guest-count, #service-select, #master-select, [name="policy_agreement"]');
        let firstInvalid = null;
        $fields.each(function () {
            const $field = $(this);
            if (!showFieldResult($field, errorFor($field)) && !firstInvalid) firstInvalid = $field;
        });
        if (firstInvalid) {
            $confirmation.hide();
            $errors.text('Проверьте каждое поле, отмеченное сообщением.').stop(true, true).slideDown(250);
            firstInvalid.trigger('focus');
            return;
        }

        const service = findService($service.val());
        const person = findMaster($master.val());
        const quantity = Number($guests.val());
        const message = 'Заявка подготовлена для ' + $name.val().trim() + ': ' + service.name + ', ' + person.name + ', ' + $date.val() + ' в ' + $time.val() +
            '. Ориентировочная стоимость: ' + money(getServicePrice(service, person) * quantity) + '. Это демонстрация: заявка не отправлена и время не подтверждено.';
        $errors.stop(true, true).slideUp(180);
        $confirmation.stop(true, true).hide().text(message).fadeIn(350, function () {
            $(this).attr('tabindex', '-1').trigger('focus');
        });
    });

    $form.on('reset', function () {
        window.setTimeout(function () {
            $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
            $form.find('.invalid-feedback').text('');
            $errors.stop(true, true).slideUp(150);
            $confirmation.stop(true, true).fadeOut(150, function () {
                $(this).text('Эта форма не отправляет данные. Позвоните администратору, чтобы подтвердить время.').fadeIn(200);
            });
            requestedMaster = '';
            updateSelection();
        }, 0);
    });

    $guests.on('input', updateSelection);
    updateSelection();
});
