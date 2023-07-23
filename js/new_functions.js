
  function createTableItems(data) {
   
    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = ''
    data.forEach((item) => {

      if (item.Code.indexOf("DZHR") !== -1) {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column');
    
        const image = document.createElement('img');
        image.src = item.Quicklook;
        columnDiv.appendChild(image);
    
        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = item.Code;
        columnDiv.appendChild(name);
    
        const button = document.createElement('div');
        button.classList.add('button');
        button.classList.add('fa', 'fa-solid', 'fa-eye');

        button.addEventListener('click', () => {
          inputId.value = name.textContent;
          findImage()
        });
        columnDiv.appendChild(button);
    
        tableContainer.appendChild(columnDiv);
      }    

    });
  }



  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Настройки для рисования полигонов (в данном случае - квадратов)
  var drawOptions = {
    draw: {
      rectangle: {}, // Опции для квадрата (оставляем пустыми для включения)
      polygon: false, // Отключаем рисование полигонов (и других фигур)
      polyline: false, // Отключаем рисование линий
      circle: false, // Отключаем рисование кругов
      circlemarker: false, // Отключаем рисование маркеров-кругов
      marker: false,

      
      // Задайте другие опции для рисования здесь
    },
    edit: false,
    remove: false
  };



  var drawControl = new L.Control.Draw(drawOptions);
  map.addControl(drawControl);

  // Обработчик события при завершении рисования полигона
  map.on('draw:created', function (e) {
      if(layer != undefined){
          removeEmptyLayer(layer)
      }

    layer = e.layer;      
    drawnItems.addLayer(layer);
    
    var rectangle = layer.toGeoJSON();
    var coordinates = rectangle.geometry.coordinates[0]; // Координаты хранятся в свойстве "coordinates"

    var north = coordinates[1][0];
    var west = coordinates[3][0];
    var east = coordinates[1][1];
    var south = coordinates[3][1];
    const inputStartDate = document.getElementById('startDate').value;
    const inputEndDate = document.getElementById('endDate').value;

    
    var path = "http://old-eo.gharysh.kz/CatalogService?DateFr=" + inputStartDate + "&DateTo=" + inputEndDate + "&West="+ west + "&East="+ east + "&South="+ south + "&North=" + north
      fetch(path)
          .then(function (response) {
              return response.json()
          })
          .then(function (data) {
            createTableItems(data.data)
          
          })
  });