const inputEndLine = document.getElementById('input3');
const inputFirstLine = document.getElementById('input2');
const kmlButton = document.getElementById('kmlButton');
const buttonFind = document.getElementById('btnFind');
const labelRes = document.getElementById('labelRes');
const inputId = document.getElementById('input1');

var maxLine = 0;
var topleftQuicklook;
var toprightQuicklook
var bottomleftQuicklook;
var topleftFootprint;
var toprightFootprint;
var bottomleftFootprint;
var bottomrightFootprint;
var numberArray;
var footprint;
var quicklook;
var LineToKm;
var imageToKm;
var previousValue;

var newCoordBottomLeft;
var newCoordTopLeft;
var newCoordTopRight
var layer;

const map = L.map('map', {
    maxBounds: [[-90, -180], [90, 180]], // Максимальные границы карты (весь мир)
    maxZoom: 18, // Максимальный уровень увеличения
    minZoom: 3 // Минимальный уровень увеличения
  }).setView([50, 70], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




  
function createMouseCoordinatesControl() {
  var control = L.control({ position: 'bottomleft' });

  control.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'transparent-control mouse-coordinates-control');        
    this._div.innerHTML = '';

    // Обработчик события при перемещении указателя мыши
    map.on('mousemove', function (e) {
      var coordinates = e.latlng; // Координаты хранятся в объекте "latlng"
      var lat = coordinates.lat.toFixed(5); // Округление широты до 5 знаков после запятой
      var lng = coordinates.lng.toFixed(5); // Округление долготы до 5 знаков после запятой
      control._div.innerHTML = 'lat: ' + lat + ', lng: ' + lng;
    });

    return this._div;
  };

  return control;
}

createMouseCoordinatesControl().addTo(map);
  
























 















   










    buttonFind.onclick = function () {
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
    };





    inputEndLine.addEventListener('input', function () {
        var enteredValue = parseInt(inputEndLine.value); // Преобразуем введенное значение в число
        console.log(enteredValue)
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


        labelRes.textContent = (inputEndLine.value - inputFirstLine.value + 1).toString();

        var diffDistance = value * LineToKm;

        newCoordBottomLeft = calculateCoordinates(topleftFootprint.lat, topleftFootprint.lng, bottomleftFootprint.lat, bottomleftFootprint.lng, diffDistance);


        if (newCoordTopLeft == undefined) {
            createFootprint(topleftFootprint, toprightFootprint, newCoordBottomLeft);
        } else {
            createFootprint(newCoordTopLeft, newCoordTopRight, newCoordBottomLeft);
        }

    });

    inputFirstLine.addEventListener('input', function () {
        var enteredValue = parseInt(inputFirstLine.value); // Преобразуем введенное значение в число
        console.log(enteredValue)
        console.log(maxLine)
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
        labelRes.textContent = (inputEndLine.value - inputFirstLine.value + 1).toString();




        var diffDistance = valueFirstLine * LineToKm;
        newCoordTopLeft = calculateCoordinates(topleftFootprint.lat, topleftFootprint.lng, bottomleftFootprint.lat, bottomleftFootprint.lng, diffDistance);
        newCoordTopRight = calculateCoordinates(toprightFootprint.lat, toprightFootprint.lng, bottomrightFootprint.lat, bottomrightFootprint.lng, diffDistance);







        if (newCoordBottomLeft == undefined) {
            createFootprint(newCoordTopLeft, newCoordTopRight, bottomleftFootprint);
        } else {
            createFootprint(newCoordTopLeft, newCoordTopRight, newCoordBottomLeft);
        }
    });




    kmlButton.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';

        // Обработчик события выбора файла
        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];

            // Чтение содержимого файла
            const reader = new FileReader();
            reader.onload = function (e) {
                const kmlText = e.target.result;
                // Загрузка и добавление KML на карту Leaflet
                loadAndAddKML(kmlText);
            };
            reader.readAsText(file);
        });

        // Нажатие на элемент input типа "file"
        fileInput.click();

        // Функция загрузки и добавления KML на карту Leaflet
        function loadAndAddKML(kmlText) {
            const parser = new DOMParser();
            const kml = parser.parseFromString(kmlText, 'text/xml');
            // Создание слоя KML
            const kmlLayer = new L.KML(kml);
            kmlLayer.addTo(map);
        }
    })

