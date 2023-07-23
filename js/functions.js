function createSlider() {
    noUiSlider.create(slider, {
        start: [1, maxLine],
        connect: true,
        step: 1,
        orientation: 'vertical',
        margin: 623,
        range: {
            'min': 1,
            'max': maxLine
        },
        format: {
            to: value => Math.round(value),
            from: value => Math.round(value)
        },
        pips: {
            mode: 'range',
            density: 3,
            format: {
                to: value => Math.round(value),
                from: value => Math.round(value)
            }
        }
    });

    // Обработчик события при изменении значения слайдера
    slider.noUiSlider.on('update', function (values, handle) {
        if (handle == 0){
            inputFirstLine.value = values[handle];
            firstLine(inputFirstLine.value)
        }
        else{
            inputEndLine.value = values[handle]
            endLine(inputEndLine.value)
        }
        //createFootprint();
    });
}



function reinitializeSlider() {
  
    if (slider.innerHTML.trim() === '') {
        createSlider();
    } else{
        slider.noUiSlider.destroy();
        createSlider();
    }
    // Создаем слайдер с новыми настройками

}



function setLines(imageUrl) {
    getImageSize(imageUrl)
        .then(size => {
            var temp = Math.round(size.height / (size.width / 125) * 5 - 5)
            if (temp % 5 != 0) {
                // if(temp % 5 >= 6){
                //     this.allLine = temp - (temp % 5) + 10
                // }
                // else if (temp % 5 <= 4){
                //   this.allLine = temp - (temp % 5) + 5
                // }
                if (temp % 5 >= 6) {
                    inputEndLine.value = temp - (temp % 5) + 10
                    maxLine = temp - (temp % 5) + 10
                }
                else if (temp % 5 < 6 && temp % 5 > 1) {
                    inputEndLine.value = temp - (temp % 5) + 5
                    maxLine = temp - (temp % 5) + 5
                }
                else {
                    inputEndLine.value = (temp - temp % 5)
                    maxLine = (temp - temp % 5);
                }

            }
            else {
                inputEndLine.value = temp
                maxLine = temp;
            }
            inputFirstLine.value = 1;
            labelRes.textContent = "Numbers of lines: " + maxLine.toString();
            inputEndLine.max = maxLine;
            imageToKm = calculateDistance(numberArray[2], numberArray[3], numberArray[0], numberArray[1])
            LineToKm = imageToKm / maxLine;
            reinitializeSlider()
        

        })
        .catch(error => {
            console.error('Ошибка:', error.message);
        });
};


function calculateCoordinates(startLat, startLng, endLat, endLng, distance) {
    // Преобразование градусов в радианы
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    // Радиус Земли в километрах
    const earthRadius = 6371;

    // Преобразование координат в радианы
    const lat1 = toRadians(startLat);
    const lng1 = toRadians(startLng);
    const lat2 = toRadians(endLat);
    const lng2 = toRadians(endLng);

    // Вычисление разницы координат
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Вычисление синуса половинного расстояния между точками
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    // Вычисление угла между точками
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Вычисление расстояния между точками
    const totalDistance = earthRadius * c;

    // Вычисление доли пройденного расстояния
    const fraction = distance / totalDistance;

    // Вычисление промежуточных координат
    const intermediateLat = startLat + (endLat - startLat) * fraction;
    const intermediateLng = startLng + (endLng - startLng) * fraction;

    // Возвращение промежуточных координат
    return [intermediateLat, intermediateLng];
}




function getImageSize(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const width = img.width;
            const height = img.height;
            resolve({ width, height });
        };
        img.onerror = function () {
            reject(new Error('Не удалось загрузить изображение'));
        };
        img.src = url;
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Радиус Земли в километрах

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c;
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function createQuicklook(imageUrl, topleft, topright, bottomleft) {
    removeEmptyLayer(quicklook)
    quicklook = L.imageOverlay.rotated(imageUrl, topleft, topright, bottomleft, {
        opacity: 1,
        interactive: true,
    }).addTo(map);
}


function createFootprint(topleft, topright, bottomleft) {
    removeEmptyLayer(footprint)
    footprint = L.imageOverlay.rotated("icon.svg", topleft, topright, bottomleft, {
        opacity: 1,
        interactive: true,
    }).addTo(map);
}


function copyText() {
    // Получение ссылки на элемент label


    // Создание временного элемента input для копирования значения текста
    var tempInput = document.createElement('input');
    tempInput.value = inputId.value + '\t' + inputFirstLine.value + '\t' + labelRes.textContent.replace(/\D/g, '');



    // Добавление временного элемента в DOM
    document.body.appendChild(tempInput);

    // Выделение текста во временном элементе
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Для мобильных устройств

    // Копирование текста в буфер обмена
    document.execCommand('copy');

    // Удаление временного элемента из DOM
    document.body.removeChild(tempInput);
    const regex = /\d+/;

    // Используем метод match() для поиска числа в строке
    const matchResult = labelRes.textContent.match(regex);
    // Визуальная обратная связь
    if (matchResult[0] < 624) {
        alert('Количество линий не должно быть меньше 624!');
    }

}





function removeEmptyLayer(layer) {
    if (layer != undefined) {
        map.removeLayer(layer);
    } 
}

















