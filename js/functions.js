

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
            else { inputEndLine.value = temp
                maxLine = temp;
            }
            inputFirstLine.value = 1;
            labelRes.textContent = maxLine.toString();
            inputEndLine.max = maxLine;
            imageToKm = calculateDistance(numberArray[2], numberArray[3], numberArray[0], numberArray[1])
            LineToKm = imageToKm/maxLine;
            console.log(LineToKm);

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


L.ImageOverlay.Rotated = L.ImageOverlay.extend({

    initialize: function (image, topleft, topright, bottomleft, options) {

        if (typeof (image) === 'string') {
            this._url = image;
        } else {
            // Assume that the first parameter is an instance of HTMLImage or HTMLCanvas
            this._rawImage = image;
        }

        this._topLeft = L.latLng(topleft);
        this._topRight = L.latLng(topright);
        this._bottomLeft = L.latLng(bottomleft);

        L.setOptions(this, options);
    },


    onAdd: function (map) {
        if (!this._image) {
            this._initImage();

            if (this.options.opacity < 1) {
                this._updateOpacity();
            }
        }

        if (this.options.interactive) {
            L.DomUtil.addClass(this._rawImage, 'leaflet-interactive');
            this.addInteractiveTarget(this._rawImage);
        }

        map.on('zoomend resetview', this._reset, this);

        this.getPane().appendChild(this._image);
        this._reset();
    },


    onRemove: function (map) {
        map.off('zoomend resetview', this._reset, this);
        L.ImageOverlay.prototype.onRemove.call(this, map);
    },


    _initImage: function () {
        var img = this._rawImage;
        if (this._url) {
            img = L.DomUtil.create('img');
            img.style.display = 'none';	// Hide while the first transform (zero or one frames) is being done

            if (this.options.crossOrigin) {
                img.crossOrigin = '';
            }

            img.src = this._url;
            this._rawImage = img;
        }
        L.DomUtil.addClass(img, 'leaflet-image-layer');

        // this._image is reused by some of the methods of the parent class and
        // must keep the name, even if it is counter-intuitive.
        var div = this._image = L.DomUtil.create('div',
            'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));

        this._updateZIndex(); // apply z-index style setting to the div (if defined)

        div.appendChild(img);

        div.onselectstart = L.Util.falseFn;
        div.onmousemove = L.Util.falseFn;

        img.onload = function () {
            this._reset();
            img.style.display = 'block';
            this.fire('load');
        }.bind(this);

        img.alt = this.options.alt;
    },


    _reset: function () {
        var div = this._image;

        if (!this._map) {
            return;
        }

        // Project control points to container-pixel coordinates
        var pxTopLeft = this._map.latLngToLayerPoint(this._topLeft);
        var pxTopRight = this._map.latLngToLayerPoint(this._topRight);
        var pxBottomLeft = this._map.latLngToLayerPoint(this._bottomLeft);

        // Infer coordinate of bottom right
        var pxBottomRight = pxTopRight.subtract(pxTopLeft).add(pxBottomLeft);

        // pxBounds is mostly for positioning the <div> container
        var pxBounds = L.bounds([pxTopLeft, pxTopRight, pxBottomLeft, pxBottomRight]);
        var size = pxBounds.getSize();
        var pxTopLeftInDiv = pxTopLeft.subtract(pxBounds.min);

        // LatLngBounds are needed for (zoom) animations
        this._bounds = L.latLngBounds(this._map.layerPointToLatLng(pxBounds.min),
            this._map.layerPointToLatLng(pxBounds.max));

        L.DomUtil.setPosition(div, pxBounds.min);

        div.style.width = size.x + 'px';
        div.style.height = size.y + 'px';

        var imgW = this._rawImage.width;
        var imgH = this._rawImage.height;
        if (!imgW || !imgH) {
            return;	// Probably because the image hasn't loaded yet.
        }

        // Sides of the control-point box, in pixels
        // These are the main ingredient for the transformation matrix.
        var vectorX = pxTopRight.subtract(pxTopLeft);
        var vectorY = pxBottomLeft.subtract(pxTopLeft);

        this._rawImage.style.transformOrigin = '0 0';

        // The transformation is an affine matrix that switches
        // coordinates around in just the right way. This is the result
        // of calculating the skew/rotation/scale matrices and simplyfing
        // everything.
        this._rawImage.style.transform = "matrix(" +
            (vectorX.x / imgW) + ', ' + (vectorX.y / imgW) + ', ' +
            (vectorY.x / imgH) + ', ' + (vectorY.y / imgH) + ', ' +
            pxTopLeftInDiv.x + ', ' + pxTopLeftInDiv.y + ')';

    },


    reposition: function (topleft, topright, bottomleft) {
        this._topLeft = L.latLng(topleft);
        this._topRight = L.latLng(topright);
        this._bottomLeft = L.latLng(bottomleft);
        this._reset();
    },


    setUrl: function (url) {
        this._url = url;
        if (this._rawImage) {
            this._rawImage.src = url;
        }
        return this;
    }
});



L.imageOverlay.rotated = function (imgSrc, topleft, topright, bottomleft, options) {
    return new L.ImageOverlay.Rotated(imgSrc, topleft, topright, bottomleft, options);
};

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
    footprint = L.imageOverlay.rotated("test.png", topleft, topright, bottomleft, {
        opacity: 1,
        interactive: true,
    }).addTo(map);
}


function copyText() {
    // Получение ссылки на элемент label


    // Создание временного элемента input для копирования значения текста
    var tempInput = document.createElement('input');
    tempInput.value = inputId.value + '\t' + inputFirstLine.value + '\t' + labelRes.textContent;



    // Добавление временного элемента в DOM
    document.body.appendChild(tempInput);

    // Выделение текста во временном элементе
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Для мобильных устройств

    // Копирование текста в буфер обмена
    document.execCommand('copy');

    // Удаление временного элемента из DOM
    document.body.removeChild(tempInput);

    // Визуальная обратная связь
    if(labelRes.textContent < 624){
        alert('Количество линий не должно быть меньше 624!');
    }
    
}


    


function removeEmptyLayer(layer) {
    if (layer != undefined) {
        map.removeLayer(layer);
        console.log("Слой удален");
    } else {
        console.log("Слой не пустой, не удален");
    }
}

















