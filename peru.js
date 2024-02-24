const axios = require('axios');

const url = 'https://cof.cnois.gob.pe/customer-office/net.eads.astrium.faceo.HomePage/catalogueService.rpc';

const requestData = `7|0|19|https://cof.cnois.gob.pe/customer-office/net.eads.astrium.faceo.HomePage/|9D1AA2A7BC3B5889421A063E7AE29AAC|net.eads.astrium.faceo.middleware.gwt.client.ICatalogueGWTService|queryCatalogueSetRecords|net.eads.astrium.faceo.core.apis.catalogue.CatalogueSetRecordQuery/112575587|net.eads.astrium.faceo.core.apis.common.request.Criteria/4096422861|net.eads.astrium.faceo.core.apis.catalogue.CatalogueRecordQuery/3099495460|java.util.ArrayList/4159755760|net.eads.astrium.faceo.common.data.geographical.Box/1418754578|net.eads.astrium.faceo.common.data.geographical.GeoPosition/3149863295|EPSG:4326|net.eads.astrium.faceo.core.apis.catalogue.Filter/3466992857||java.lang.String/2004016611|SPOT 6/7|PerúSAT-1|net.eads.astrium.faceo.common.data.temporal.Period/2004917229|java.util.Date/3385151746|java.lang.Integer/3438268394|1|2|3|4|2|5|6|5|7|8|1|9|10|0|50|69|10|0|52|74|0|11|8|1|12|8|0|0|0|0|0|0|13|-1|8|2|14|15|14|16|55|8|1|17|18|Y2t7OT_|18|YUcF80A|8|1|19|0|0|0|6|0|0|0|`;

const headers = {
    'Accept': '*/*',
    'Content-Type': 'text/x-gwt-rpc; charset=UTF-8',
    'X-GWT-Module-Base': 'https://cof.cnois.gob.pe/customer-office/net.eads.astrium.faceo.HomePage/',
    'X-GWT-Permutation': '1A6EE8D05907E248BF9CABFAEB464359',
    // Добавьте дополнительные заголовки здесь, если это необходимо
};

axios.post(url, requestData, { headers: headers })
    .then(response => {
        // Предполагается, что ответ - это JSON, и в нём есть поле для географической информации
        const xml2js = require('xml2js');
const parser = new xml2js.Parser();

// Предположим, response.data содержит ваш XML/JSON ответ от сервера
const responseData = response.data; // response.data должен быть вашим реальным ответом от сервера

// Извлекаем XML часть
const xmlPart = responseData.substring(responseData.indexOf('<?xml'), responseData.lastIndexOf('>') + 1);

// Конвертируем XML в JSON
parser.parseString(xmlPart, function (err, result) {
    if (err) {
        console.error('Ошибка парсинга XML:', err);
        return;
    }
    
    // Доступ к Geographic Location Information в JSON
    // Замените 'pathToGeographicLocationInformation' на реальный путь в полученном JSON объекте
    const geographicLocationInformation = result.pathToGeographicLocationInformation;
    console.log(geographicLocationInformation);
});

    })
    .catch(error => {
        console.error('Ошибка запроса:', error);
    });




    