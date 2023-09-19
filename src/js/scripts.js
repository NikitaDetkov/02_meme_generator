// Поле для загрузки изображения
const imageInput = document.querySelector('#image-input');
// Поле для предварительного просмотра изображения
const imagePreview = document.querySelector('#image-preview');
// Кнопка для скачивания изображения
const saveImageBtn = document.querySelector('#save-image-btn');
// Контейнер-обертка для поля предварительного просмотра
const imageContainer = document.querySelector('#constructor__image-preview-wrapper');
// Кнопка добавления текста
const addTextBtn = document.querySelector('#add-text-btn');
// Кнопка удаления текстового элемента
const deleteTextBtn = document.querySelector('#delete-text-btn');
// Элемент с меню настроек текстовых элементов
const textEditor = document.querySelector('#text-editor');
// Блок с сообщением о просьбе выбрать текстовый элемент 
const messageEditor = document.querySelector('#message-editor');
// Кнопка для увеличения шрифта текста
const btnPlusFont = document.querySelector('#plus');
// Кнопка для уменьшения шрифта текста
const btnMinusFont = document.querySelector('#minus');
// Поле с размером шрифта текста
const fontSize = document.querySelector('#current-font-size');
// Checkbox для наличия фона
const backgroundNone = document.querySelector('#background-none');
// Поля с rgb-настройками цвета текста
const colorsElemFont = {
    red: document.querySelector('#font-color-red'),
    green: document.querySelector('#font-color-green'),
    blue: document.querySelector('#font-color-blue'),
}
// Поля с rgb-настройками цвета фона
const colorsElemBackground = {
    red: document.querySelector('#background-color-red'),
    green: document.querySelector('#background-color-green'),
    blue: document.querySelector('#background-color-blue'),
}
// Поле для семейства шрифта
const fontFamily = document.querySelector('#font-family'); 
// Счетчик текстовых полей
let counterText = 0;
// id всех имеющихся текстовых полей
let textElemsId = {};
let activeTextNumber = -1;

// Слушатели событий ===========================================================

// Слушатель событий для отображения изображения
imageInput.addEventListener('change', showImage)
// Слушатель событий для сохранения изображения
saveImageBtn.addEventListener('click', saveImage);
// Слушатель событий для добавления текста 
addTextBtn.addEventListener('click', addText);
// Слушатель событий для удаления текста 
deleteTextBtn.addEventListener('click', () => {
    if (activeTextNumber !== -1) deleteActiveTextElem();
});
// Слушатели событий для изменения цвета текста  
for (const key in colorsElemFont) {
    colorsElemFont[key].addEventListener('input', function() {
        changeColor(colorsElemFont, 'color');
    })
}
// Слушатели событий для изменения цвета фона  
for (const key in colorsElemBackground) {
    colorsElemBackground[key].addEventListener('input', function() {
        backgroundNone.checked = true;
        changeColor(colorsElemBackground, 'background-color');
    })
}
// Слушатель событий для кнопки увеличения шрифта
btnPlusFont.addEventListener('click', () => {
    if (Number(fontSize.innerHTML) < 40) {
        fontSize.innerHTML = Number(fontSize.innerHTML) + 1;
        changeTextFontSize(activeTextNumber);
        setWidth(activeTextNumber); // Изменить ширину поля ввода
    }
});
// Слушатель событий для кнопки уменьшения шрифта 
btnMinusFont.addEventListener('click', () => {
    if (Number(fontSize.innerHTML) >= 5) {
        fontSize.innerHTML = Number(fontSize.innerHTML) - 1;
        changeTextFontSize(activeTextNumber);
        setWidth(activeTextNumber); // Изменить ширину поля ввода
    }
});
// Слушатель событий для изменении семейства шрифта
fontFamily.addEventListener('change', () => {
    changeFontFamily(activeTextNumber);
    setWidth(activeTextNumber); // Изменить ширину поля ввода
});

// Слушатель событий для поля редактирования по нажатию
// Для скрытия меню редактирования
imageContainer.addEventListener('click', () => {
    if (activeTextNumber !== -1) cancelChooseTextElem();
});

// Слушатель событий для checkbox, отвечающий за наличие фона
// для активного текстового элемента
backgroundNone.addEventListener('change', () => {
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    colorsElemBackground['red'].value = 255;
    colorsElemBackground['green'].value = 255;
    colorsElemBackground['blue'].value = 255;

    if (backgroundNone.checked) {
        activeTextElem.style.backgroundColor = 'rgb(255, 255, 255)';
    } else {
        activeTextElem.style.background = 'none';
    }
})

// Функции ==========================================================================

// Функция для отображения изображения
function showImage() {
    const imageFile = imageInput.files[0];
    imagePreview.setAttribute('src', URL.createObjectURL(imageFile));
}

// Функция сохранения изображения
function saveImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;

    // Нарисовать изображение
    ctx.drawImage(imagePreview, 0, 0, canvas.width, canvas.height);
    ctx.scale(1, 1);

    // Нарисовать текст
    const coefficient = imagePreview.naturalHeight / imagePreview.height;

    // Координаты главного изображения
    const rectImage = imagePreview.getBoundingClientRect();

    // Цикл по всем тестовым элементам
    for (const key in textElemsId) {
        // Элемент
        const idElem = textElemsId[key];
        const elem = document.getElementById(idElem);

        // Отрисовать, если есть текст
        if (elem.value.length > 0) {
            // Положение элемента
            const rect = elem.getBoundingClientRect();
            // Рисование фона
            if (elem.style.background !== 'none') {
            // Выбор ширины фона
                const width = elem.scrollWidth > rect.right - rect.left 
                    ? elem.scrollWidth : rect.right - rect.left;
                ctx.fillStyle = elem.style.backgroundColor;
                ctx.fillRect(coefficient * (rect.left - rectImage.left),
                coefficient * (rect.top - rectImage.top), 
                coefficient * width, 
                coefficient * (rect.bottom - rect.top));
            }

            // Установка стилей для элемента
            let fontSizeElem = elem.style.fontSize; 
            fontSizeElem = Number(fontSizeElem.substring(0, fontSizeElem.length - 2));
            const fontFamilyElem = elem.style.fontFamily;
            const fontStyleElem = elem.style.fontStyle;
            const fontWeightElem = elem.style.fontWeight;
            // Создание стиля шрифта
            ctx.font = fontStyleElem + ' ' + fontWeightElem + ' ' + 
                coefficient * fontSizeElem + 'px ' + fontFamilyElem + ' , sans-serif';
            ctx.fillStyle = elem.style.color;
            // Рисование текста
            ctx.fillText(elem.value, 
                coefficient * (rect.left - rectImage.left + 5), 
                coefficient* (rect.top - rectImage.top + 5 + fontSizeElem));
        }
    }

    // Загрузка изображения
    const link = document.createElement('a');
    link.download = 'image.jpg';
    link.href = canvas.toDataURL();
    link.click();
}

// Функция для добавления текста
function addText() {
    const inputTextElem = document.createElement('input');
    inputTextElem.type = 'text';
    inputTextElem.id = `text-${counterText}`;
    inputTextElem.classList.add('input-text');
    inputTextElem.placeholder = 'Enter text';

    // Установка начальных стилей для текста
    setStartStyle(inputTextElem);
    // Добавление текста на поле редактирования
    imageContainer.append(inputTextElem);

    // Сохранение id текста
    textElemsId[counterText] = inputTextElem.id;

    // Установка Drag’n’Drop для перемещения текста
    setDragNDropEvent(inputTextElem);

    // Функция-обертка для слушателя событий (привязка к id текстового элемента)
    let wrapperFunction = {
        numberText: counterText,
        chooseElem: function() {
            return chooseTextElem(this.numberText);
        },
    };
    // Слушатель собылий для текстого элемента
    // Необходим для открытия меню редактирования данного элемента
    inputTextElem.addEventListener('focusin', function() {
        wrapperFunction.chooseElem();
    });

    // Слушатель событий для изменения размера поля ввода
    inputTextElem.addEventListener('input', () => {
        setWidth(activeTextNumber); // Изменить ширину поля ввода
    })

    counterText++;
}

// Функция для установки Drag’n’Drop для текстового элемента
// ПРинимает: HTML-элелемент, являющийся input:text
function setDragNDropEvent(inputTextElem) {
    //* Флаг перетаскивания
    let isDrag = false;

    //* Ограничения, за которые нельзя вытащить small
    var limits = {
        top: imageContainer.offsetTop,
        right: imageContainer.offsetWidth + imageContainer.offsetLeft - inputTextElem.offsetWidth,
        bottom: imageContainer.offsetHeight + imageContainer.offsetTop - inputTextElem.offsetHeight,
        left: imageContainer.offsetLeft
    };

    inputTextElem.onmousedown = function(event) {
        // Флаг разрешения движения
        isDrag = true;

        // Изначальный сдвиг осносительно указателя мыши
        let shiftX = event.clientX - inputTextElem.getBoundingClientRect().left;
        let shiftY = event.clientY - inputTextElem.getBoundingClientRect().top;
      
        document.body.append(inputTextElem);
      
        moveAt(event.pageX, event.pageY);
      
        // Передвигать эелемент при движении мыши
        document.addEventListener('mousemove', onMouseMove);
      
        // При отпускании кнопки мыши прекратить движение и удалить обработчики
        // событий
        inputTextElem.onmouseup = function() {
            isDrag = false;
            document.removeEventListener('mousemove', onMouseMove);
            inputTextElem.onmouseup = null;
        };

        // Вычисление координат
        function move(event) {
            var newLocation = {
                x: limits.left + shiftX,
                y: limits.top + shiftY
            };

            if (event.pageX - shiftX > limits.right) {
                newLocation.x = limits.right + shiftX;
            } else if (event.pageX - shiftX > limits.left) {
                newLocation.x = event.pageX;
            }

            if (event.pageY - shiftY > limits.bottom) {
                newLocation.y = limits.bottom + shiftY;
            } else if (event.pageY > limits.top) {
                newLocation.y = event.pageY;
            }

            moveAt(newLocation.x, newLocation.y);  
        }
      
        // Переносит текст на координаты (pageX, pageY),
        // дополнительно учитывая изначальный сдвиг относительно указателя мыши
        function moveAt(pageX, pageY) {
            inputTextElem.style.left = pageX - shiftX + 'px';
            inputTextElem.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(event) {
            if (isDrag) {
                move(event);
            }
        }
    };
    // Отключить браузерный Drag’n’Drop
    inputTextElem.ondragstart = function() {
        return false;
    };
}

// Функция для установки стартовых стилей
// Принимает: текстовый элемент
// Устанавливеат стартовые стили, чтобы в дальнейшем получиить
// их значения для меню конструктора
function setStartStyle(inputTextElem) {
    inputTextElem.style.color = 'rgb(0, 0, 0)';
    inputTextElem.style.backgroundColor = 'rgb(255, 255, 255)';
    inputTextElem.style.fontSize = 16 + 'px';
    inputTextElem.style.fontFamily = 'Montserrat-font';
    inputTextElem.style.fontStyle = 'normal';
    inputTextElem.style.fontWeight = 'normal';
    inputTextElem.style.background = inputTextElem.style.backgroundColor;
}

// Функция для открытия меню при выборе текстового элемента
function chooseTextElem(numberElem) {
    textEditor.classList.add('show');
    messageEditor.classList.remove('show');

    activeTextNumber = numberElem;
    // Установка значений настроек в зависимости от выбранного элемента
    setInputValues(activeTextNumber);
}

// Функция для скрытия меню редактирования и отмены выбора тестового элемента
function cancelChooseTextElem() {
    textEditor.classList.remove('show');
    messageEditor.classList.add('show');

    activeTextNumber = -1;
}

// Функция для установки цвета текста
function changeColor(colorsElem, styleElem) {
    const red = colorsElem['red'].value;
    const green = colorsElem['green'].value;
    const blue = colorsElem['blue'].value;

    document.querySelector(`#text-${activeTextNumber}`).style[styleElem] = `rgb(${red}, ${green}, ${blue})`;
}

// Функция для задания старотвых значений input-элементам 
// в зависимости от выбранного текстового элемента
// Принимает: номер активного элемента
function setInputValues(activeTextNumber) {
    // активный элемент
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);

    // Размер шрифта выбранного элемента
    const fontSizeElem = activeTextElem.style.fontSize;
    fontSize.innerHTML = fontSizeElem.substring(0, fontSizeElem.length - 2);
    // Семейство шрифта выбранного элемента 
    const fontFamilyElem = activeTextElem.style.fontFamily;
    fontFamily.value = fontFamilyElem;
    // Стиль шрифта выбранного элемента 
    const fontStyleElem = activeTextElem.style.fontStyle;
    document.querySelector(`#style-${fontStyleElem}`).checked = true;
    // Вес шрифта выбранного элемента
    const fontWeightElem = activeTextElem.style.fontWeight;
    document.querySelector(`#weight-${fontWeightElem}`).checked = true;

    // Значения цвета шрифта активного элемента
    const colors = activeTextElem.style['color'].split('(')[1].split(')')[0].split(','); 
    colorsElemFont['red'].value = Number(colors[0]);
    colorsElemFont['green'].value = Number(colors[1]);
    colorsElemFont['blue'].value = Number(colors[2]);

    // Задание наличия фона
    const background = activeTextElem.style.background;

    if (background !== 'none') {
        backgroundNone.checked = true;
        // Значения цвета фона активного элемента
        const colorsBackground = activeTextElem.style['background-color'].split('(')[1].split(')')[0].split(','); 
        colorsElemBackground['red'].value = Number(colorsBackground[0]);
        colorsElemBackground['green'].value = Number(colorsBackground[1]);
        colorsElemBackground['blue'].value = Number(colorsBackground[2]);
    } else {
        backgroundNone.checked = false;
        colorsElemBackground['red'].value = 255;
        colorsElemBackground['green'].value = 255;
        colorsElemBackground['blue'].value = 255;
    }
}

// Функция для установления нового значения размера шрифта
// выбранному тестовому элементу
function changeTextFontSize(activeTextNumber) {
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    activeTextElem.style.fontSize = Number(fontSize.innerHTML) + 'px';
}

// Функция для установления нового значения семейства шрифта
// выбранному тестовому элементу
function changeFontFamily(activeTextNumber) {
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    activeTextElem.style.fontFamily = fontFamily.value;
}

// Функция для установления нового значения стиля шрифта
// выбранному тестовому элементу
function changeFontStyle() {
    const fontStyle = document.querySelector('input[name="font-style"]:checked');
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    activeTextElem.style.fontStyle = fontStyle.value;
}

// Функция для установления нового значения веса шрифта
// выбранному тестовому элементу
function changeFontWeight() {
    const fontWeight = document.querySelector('input[name="font-weight"]:checked');
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    activeTextElem.style.fontWeight = fontWeight.value;
}

// Функция для удаления активного текстового элемента
function deleteActiveTextElem() {
    // Удаление из объекта с id
    delete textElemsId[activeTextNumber];
    // Удаление HTML-элемента
    const activeTextElem = document.querySelector(`#text-${activeTextNumber}`);
    activeTextElem.remove();
    // Отмена выбора тестового элемента (скрытие меню редактирования)
    cancelChooseTextElem();
}

// Функция для установки валидной ширины поля ввода
function setWidth(textNumber) {
    const inputTextElem = document.querySelector(`#text-${textNumber}`);

    // Если меньше одного символа, то auto (для плэйсхолдера)
    if (inputTextElem.value.length < 1) {
        inputTextElem.style.width = 'auto';
    } else { // Иначе адаптировать под контент
        inputTextElem.style.width = 0;
        inputTextElem.style.width = inputTextElem.scrollWidth + 'px';
    }
}
