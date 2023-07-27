function findImage() {
    newCoordBottomLeft = undefined;        
        newCoordTopLeft = undefined;
        newCoordTopRight = undefined;
        var inputValue = inputId.value;
        const year = inputValue.slice(9, 13);
        const month = inputValue.slice(13, 15);
        const day = inputValue.slice(15, 17);
        var date = year + "-" + month + "-" + day;

        

        var path = "http://10.0.6.117:8001/CatalogService?DateFr=" + date + "&DateTo=" + date + "&West=179.356737&East=79.563306&South=-37.146315&North=-179.766815"
        fetch(path)
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                const latId = inputValue.substring(inputValue.indexOf("_E") + 2, inputValue.indexOf("N"));
                const lngId = inputValue.substring(inputValue.indexOf("N") + 2, inputValue.indexOf("__"));
          
                // map.setView([latId, lngId], 3);

                const codeToFind = inputValue;
                const foundObject = data.data.find(obj => obj.Code === codeToFind);
                var imageUrl = foundObject.Quicklook;
                numberArray = foundObject.Coordinates.split(" ");
                topleftQuicklook = L.latLng(numberArray[2], numberArray[3]), //L.latLng(51, 71.1945229029271), 
                    toprightQuicklook = L.latLng(numberArray[4], numberArray[5]), //L.latLng(50.95, 71.48520586501472),
                    bottomleftQuicklook = L.latLng(numberArray[0], numberArray[1]);

                bottomrightFootprint = L.latLng(numberArray[6], numberArray[7]);
                topleftFootprint = L.latLng(numberArray[2], numberArray[3]), //L.latLng(51, 71.1945229029271), 
                    toprightFootprint = L.latLng(numberArray[4], numberArray[5]), //L.latLng(50.95, 71.48520586501472),
                    bottomleftFootprint = L.latLng(numberArray[0], numberArray[1]);

                createQuicklook(imageUrl, topleftQuicklook, toprightQuicklook, bottomleftQuicklook);
                createFootprint(topleftFootprint, toprightFootprint, bottomleftFootprint);

                setLines(imageUrl);  
      

            })
            
}



function endLine(enteredValue){
    if (isNaN(enteredValue)) { // Проверяем, является ли введенное значение числом
        // Если введенное значение не является числом, сбрасываем поле ввода
        inputEndLine.value = '';
    } else if (enteredValue < 1) {
        // Если введенное значение превышает максимальное, устанавливаем максимальное значение
        inputEndLine.value = 1;
    } else if (enteredValue > maxLine) {
        inputEndLine.value = maxLine
    }
    var value = inputEndLine.value;
    labelRes.textContent = "Numbers of lines: " + (inputEndLine.value - inputFirstLine.value + 1).toString();

    var diffDistance = value * LineToKm;

    newCoordBottomLeft = calculateCoordinates(topleftFootprint.lat, topleftFootprint.lng, bottomleftFootprint.lat, bottomleftFootprint.lng, diffDistance);


    if (newCoordTopLeft == undefined) {
        createFootprint(topleftFootprint, toprightFootprint, newCoordBottomLeft);
    } else {
        createFootprint(newCoordTopLeft, newCoordTopRight, newCoordBottomLeft);
    }
}

function firstLine(enteredValue){
    if (isNaN(enteredValue)) {
        inputFirstLine.value = '';
    } else if (enteredValue > maxLine) {
        // Если введенное значение превышает максимальное, устанавливаем максимальное значение
        inputFirstLine.value = maxLine;
    } else if (enteredValue < 1) {
        // Если введенное значение превышает максимальное, устанавливаем максимальное значение
        inputFirstLine.value = 1;
    }
    else if (enteredValue > (inputEndLine.value - 623)) {
        // Если введенное значение превышает максимальное, устанавливаем максимальное значение
        inputFirstLine.value = inputEndLine.value - 623;
    }
    var valueFirstLine = inputFirstLine.value;
    labelRes.textContent = "Numbers of lines: " +  (inputEndLine.value - inputFirstLine.value + 1).toString();




    var diffDistance = valueFirstLine * LineToKm;
    newCoordTopLeft = calculateCoordinates(topleftFootprint.lat, topleftFootprint.lng, bottomleftFootprint.lat, bottomleftFootprint.lng, diffDistance);
    newCoordTopRight = calculateCoordinates(toprightFootprint.lat, toprightFootprint.lng, bottomrightFootprint.lat, bottomrightFootprint.lng, diffDistance);







    if (newCoordBottomLeft == undefined) {
        createFootprint(newCoordTopLeft, newCoordTopRight, bottomleftFootprint);
    } else {
        createFootprint(newCoordTopLeft, newCoordTopRight, newCoordBottomLeft);
    }
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
