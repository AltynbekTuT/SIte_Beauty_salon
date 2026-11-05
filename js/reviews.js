'use strict';

// jQuery 3.7.1: используем core API и эффекты из полной сборки, без плагинов.
$(function () {
    const $cards = $('#review-cards');
    const $form = $('#review-form');
    if (!$cards.length || !$form.length) return;

    // Переписанная функция №3: создание карточек через createElement/appendChild и обработчики DOM
    // заменены на jQuery-конструкторы, .append() и .on(). Код длиннее, но сборка карточки и её вывод разделены на понятные шаги.
    const reviewPhotos = [
        { id: 'photo-1521590832167-7bcbfaa6381f', topic: 'hair-stylist', alt: 'Работа парикмахера с волосами' },
        { id: 'photo-1519014816548-bf5fe059798b', topic: 'nail-salon', alt: 'Маникюр и уход за ногтями' },
        { id: 'photo-1516975080664-ed2fc6a32937', topic: 'makeup', alt: 'Косметика и инструменты для макияжа' }
    ];
    const reviews = [
        { name: 'Сания А.', serviceId: 'coloring', rating: 5, text: 'Очень довольна результатом! Мастер внимательно подобрала оттенок, волосы выглядят ухоженными и живыми.', date: '9 октября 2026' },
        { name: 'Алия М.', serviceId: 'manicure', rating: 5, text: 'Спасибо за аккуратную работу и приятную атмосферу. Помогли подобрать форму и цвет покрытия.', date: '9 октября 2026' },
        { name: 'Дана К.', serviceId: 'haircut', rating: 5, text: 'Мастер выслушала пожелания, подсказала, как укладывать волосы дома. Результат получился именно таким, как я хотела.', date: '9 октября 2026' }
    ];
    const $service = $('#used-service');
    const $reviewText = $('#review-text');
    const $confirmation = $('#review-confirmation');
    const $errors = $('#review-errors');
    const $permission = $('[name="publish_permission"]');
    const $counter = $('<p>').addClass('small text-muted').attr('aria-live', 'polite').text('0 / 500 символов (минимум 10)');

    $form.prop('noValidate', true);
    $service.attr('required', 'required').empty().append($('<option>').val('').text('Выберите услугу'));
    $.each([...new Set(SERVICES.map(item => item.category))], function (_index, category) {
        const $group = $('<optgroup>').attr('label', category);
        $.each(SERVICES.filter(item => item.category === category), function (_serviceIndex, service) {
            $group.append($('<option>').val(service.id).text(service.name));
        });
        $service.append($group);
    });
    $permission.attr('required', 'required');
    $reviewText.attr('maxlength', '500').after($counter);
    $errors.hide();

    function makeReviewCard(review, index) {
        const service = findService(review.serviceId);
        const photo = reviewPhotos[index % reviewPhotos.length];
        const $article = $('<article>').addClass('col-12 col-md-6 col-lg-4');
        const $card = $('<div>').addClass('review-card h-100 overflow-hidden');
        const $figure = $('<figure>').addClass('review-figure mb-0');
        const $image = $('<img>').addClass('review-photo').attr({
            src: 'https://images.unsplash.com/' + photo.id + '?auto=format&fit=crop&fm=jpg&q=85&w=900',
            alt: photo.alt,
            loading: 'lazy'
        });
        const $caption = $('<figcaption>').addClass('photo-credit px-3 pt-2').text('Иллюстрация: ');
        const $credit = $('<a>').attr({ href: 'https://unsplash.com/s/photos/' + photo.topic, target: '_blank', rel: 'noopener noreferrer' }).text('Unsplash');
        const $body = $('<div>').addClass('p-3');
        $caption.append($credit);
        $figure.append($image, $caption);
        $body.append(
            $('<h3>').addClass('h5').text(review.name),
            $('<p>').addClass('small text-muted mb-2').text((service ? service.name : 'Услуга') + ' · ' + review.rating + ' из 5 · ' + review.date),
            $('<p>').addClass('mb-0').text(review.text)
        );
        $card.append($figure, $body);
        return $article.append($card);
    }

    function renderReviews(animateFirst) {
        $cards.empty();
        $.each(reviews, function (index, review) {
            const $card = makeReviewCard(review, index);
            if (index === 0 && animateFirst) {
                // Карточка нового отзыва появляется после отправки формы; callback возвращает фокус к её заголовку.
                $card.hide().prependTo($cards).fadeIn(350, function () {
                    $(this).find('h3').attr('tabindex', '-1').trigger('focus');
                });
            } else {
                $cards.append($card);
            }
        });
    }

    function validationMessage($field) {
        const value = String($field.val() || '').trim();
        const id = $field.attr('id');
        if (id === 'author-name' && value.length < 2) return 'Введите имя (минимум 2 символа).';
        if (id === 'author-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Введите корректный email.';
        if (id === 'author-phone' && !/^\+?\d{10,15}$/.test(value.replace(/[\s()\-]/g, ''))) return 'Введите корректный номер телефона.';
        if (id === 'visit-date' && (!value || new Date(value + 'T00:00:00') >= new Date(new Date().setHours(0, 0, 0, 0)))) return 'Укажите дату визита в прошлом.';
        if (id === 'service-rating' && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5)) return 'Оценка должна быть от 1 до 5.';
        if (id === 'used-service' && !findService(value)) return 'Выберите услугу.';
        if (id === 'review-text' && (value.length < 10 || value.length > 500)) return 'Напишите от 10 до 500 символов.';
        if ($field.is('[name="publish_permission"]') && !$form.find('[name="publish_permission"]:checked').length) return 'Разрешите публикацию отзыва.';
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

    // Плавная прокрутка помогает перейти от кнопки «Оставить отзыв» к форме; без preventDefault браузер резко прыгнул бы к якорю.
    $('#reviews-list').on('click', 'a[href="#review-form"]', function (event) {
        event.preventDefault();
        const $targetForm = $(this).closest('section').siblings('section').find('#review-form');
        if (!$targetForm.length) return;
        $('html, body').stop(true).animate({ scrollTop: $targetForm.offset().top }, 300, function () {
            $targetForm.find('input:first').trigger('focus');
        });
    });

    $reviewText.on('input', function () {
        const length = String($(this).val() || '').length;
        $counter.text(length + ' / 500 символов (минимум 10)');
        showFieldResult($(this), validationMessage($(this)));
    });
    $form.on('input change', 'input, select, textarea', function () {
        showFieldResult($(this), validationMessage($(this)));
    });

    $form.on('submit', function (event) {
        // Без preventDefault браузер отправил бы форму и обновил страницу; у учебного макета нет серверного обработчика.
        // Клиентская проверка помогает заполнить форму, но не заменит проверку полученных данных на сервере.
        event.preventDefault();
        const $fields = $form.find('#author-name, #author-email, #author-phone, #visit-date, #service-rating, #used-service, #review-text, [name="publish_permission"]');
        let firstInvalid = null;
        $fields.each(function () {
            const $field = $(this);
            if (!showFieldResult($field, validationMessage($field)) && !firstInvalid) firstInvalid = $field;
        });
        if (firstInvalid) {
            $errors.text('Исправьте ошибки рядом с полями формы.').stop(true, true).slideDown(220);
            firstInvalid.trigger('focus');
            return;
        }

        reviews.unshift({
            name: String($('#author-name').val()).trim(),
            serviceId: String($service.val()),
            rating: Number($('#service-rating').val()),
            text: String($reviewText.val()).trim(),
            date: new Date().toLocaleDateString('ru-RU')
        });
        renderReviews(true);
        $errors.stop(true, true).slideUp(180);
        $confirmation.removeClass('text-muted text-danger').addClass('alert alert-success')
            .text('Отзыв добавлен в демонстрационный список. Он не отправлен на сервер и исчезнет после обновления.')
            .hide().fadeIn(300);
        $form[0].reset();
        $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $form.find('.invalid-feedback').text('');
        $counter.text('0 / 500 символов (минимум 10)');
    });

    $form.on('reset', function () {
        window.setTimeout(function () {
            $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
            $form.find('.invalid-feedback').text('');
            $counter.text('0 / 500 символов (минимум 10)');
        }, 0);
    });

    renderReviews(false);
});
