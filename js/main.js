const inputEndLine = document.getElementById('input3');
const inputFirstLine = document.getElementById('input2');
const kmlButton = document.getElementById('kmlButton');
const buttonFind = document.getElementById('btnFind');
const labelRes = document.getElementById('labelRes');
const inputId = document.getElementById('input1');
const angleInput = document.getElementById('angleInput');

var slider = document.getElementById('slider');;

var coordinatesArray = [];
var maxLine = 100;
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


var sliderMin;
var sliderMax;
//var
var kmlLayer;

var arrCoord = [];
var arrCoordRevers = [];
var arrImages = [];
var arrNames = [];


const currentDate = new Date().toISOString().slice(0, 10);

document.getElementById('startDate').value = "2023-07-01";
document.getElementById('endDate').value = currentDate;


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
       findImage();
     
    };  



    inputEndLine.addEventListener('input', function () {
        var enteredValue = parseInt(inputEndLine.value); // Преобразуем введенное значение в число
        endLine(enteredValue)
    });

    inputFirstLine.addEventListener('input', function () {
        var enteredValue = parseInt(inputFirstLine.value); // Преобразуем введенное значение в число
        firstLine(enteredValue)        
    });




    kmlButton.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
    
        // Обработчик события выбора файла
        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            
            if (file.name.endsWith('.kml')) {
                // Если выбран KML файл
                const reader = new FileReader();
                reader.onload = function (e) {
                    const kmlText = e.target.result;
                    // Загрузка и добавление KML на карту Leaflet
                    loadAndAddKML(kmlText);
                };
                reader.readAsText(file);
            } else if (file.name.endsWith('.kmz')) {
                // Если выбран KMZ файл
                const reader = new FileReader();
                reader.onload = function (e) {
                    const kmzData = e.target.result;
                    // Работа с KMZ данными
                    handleKMZData(kmzData);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    
        // Нажатие на элемент input типа "file"
        fileInput.click();
    
        // Функция загрузки и добавления KML на карту Leaflet
        function loadAndAddKML(kmlText) {
            const parser = new DOMParser();
            const kml = parser.parseFromString(kmlText, 'text/xml');
            
            getCoordFromKml(kml);
            
            removeEmptyLayer(kmlLayer);
            // Создание слоя KML
            kmlLayer = new L.KML(kml);
            map.setView(kmlLayer.getBounds().getNorthWest(), 7);
            kmlLayer.setStyle({ color: 'blue', fillColor: 'blue' });
            kmlLayer.addTo(map);
        }
    
        // Функция обработки данных KMZ
        function handleKMZData(kmzData) {
            // Создание экземпляра JSZip и загрузка KMZ данных
            const zip = new JSZip();
            zip.loadAsync(kmzData).then(function (zip) {
                // Найдите KML файл в архиве KMZ
                const kmlFile = zip.file(/.*\.kml$/i)[0];
                if (kmlFile) {
                    return kmlFile.async('string');
                } else {
                    throw new Error("KML file not found in KMZ archive.");
                }
            }).then(function (kmlContent) {
                // Преобразуйте XML KML в объект и добавьте на карту
                const parser = new DOMParser();
                const kml = parser.parseFromString(kmlContent, 'text/xml');
                
                getCoordFromKml(kml);
                
                removeEmptyLayer(kmlLayer);
                // Создание слоя KML
                kmlLayer = new L.KML(kml);
                map.setView(kmlLayer.getBounds().getNorthWest(), 7);
                kmlLayer.setStyle({ color: 'blue', fillColor: 'blue' });
                kmlLayer.addTo(map);
            }).catch(function (error) {
                console.error(error);
            });
        }
    });



    function getCoordFromKml(xmlDoc){
        const polygons = xmlDoc.querySelectorAll('Polygon');
                    for (let i = 0; i < polygons.length; i++) {
                        const coordinates = polygons[i].querySelector('coordinates').textContent.trim();
                        const coordPairs = coordinates.split(' ');
                        const polygonCoordinates = [];
                        for (let j = 0; j < coordPairs.length; j++) {
                            const [longitude, latitude, altitude] = coordPairs[j].split(',');
                            polygonCoordinates[j] = [longitude, latitude];
                        }
                        coordinatesArray[i] = polygonCoordinates;
                    }
    }

