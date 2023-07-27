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


function createTableItems(data) {
   
    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = ''
    data.forEach((item) => {

      if (item.Code.indexOf("DZHR") !== -1) {

        const coordinatesArrayImage = item.Coordinates.split(' ').map(coord => parseFloat(coord));

        // Делим массив на подмассивы, где каждый подмассив содержит широту и долготу
        var latLngArray = [];
        for (let i = 0; i < coordinatesArrayImage.length; i += 2) {
            const latitude = coordinatesArrayImage[i];
            const longitude = coordinatesArrayImage[i + 1];
            latLngArray.push([longitude, latitude]);
        }

        latLngArray.push([coordinatesArrayImage[1], coordinatesArrayImage[0]]);

       
        console.log(latLngArray)

        
        for (let j = 0; j < coordinatesArray.length; j++) {
          
            // const coordinatesAsNumbers = latLngArray.map(coord => [parseFloat(coord[0]), parseFloat(coord[1])]);
            // console.log(coordinatesAsNumbers)
            
            
            const coordinatesAsNumbers = coordinatesArray[j].map(coord => [parseFloat(coord[0]), parseFloat(coord[1])]);

        // Проверяем, чтобы первая и последняя вершины совпадали
        if (!coordinatesAsNumbers[0].every((val, index) => val === coordinatesAsNumbers[coordinatesAsNumbers.length - 1][index])) {
            coordinatesAsNumbers.push(coordinatesAsNumbers[0]); // Добавляем первую вершину в конец для закрытия полигона
        }
            
            
        const coordinatesAsNumbers2 = latLngArray.map(coord => [parseFloat(coord[0]), parseFloat(coord[1])]);

        // Проверяем, чтобы первая и последняя вершины совпадали
        if (!coordinatesAsNumbers2[0].every((val, index) => val === coordinatesAsNumbers2[coordinatesAsNumbers2.length - 1][index])) {
            coordinatesAsNumbers2.push(coordinatesAsNumbers2[0]); // Добавляем первую вершину в конец для закрытия полигона
        }
            
            
            
            
            const polygon1 = turf.polygon(
                [coordinatesAsNumbers]
            );
            // Геометрия второго полигона
            const polygon2 = turf.polygon([coordinatesAsNumbers2]);

          



            const intersection = turf.intersect(polygon1, polygon2);

            if (intersection) {
                console.log("Полигоны пересекаются!");
                console.log(intersection.geometry.coordinates);
            } else {
                console.log("Полигоны не пересекаются.");
            }
        }




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

    
    var path = "http://10.0.6.117:8001/CatalogService?DateFr=" + inputStartDate + "&DateTo=" + inputEndDate + "&West="+ west + "&East="+ east + "&South="+ south + "&North=" + north
      fetch(path)
          .then(function (response) {
              return response.json()
          })
          .then(function (data) {
            createTableItems(data.data)
          
          })
  });


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

















