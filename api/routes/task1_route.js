const {addEmployee, selectEmployee, deleteEmployeeAll} = require("../backend_cemp/data_base_cemp/crud_mongo");
const {getDataText, downloadAndSavePhotos, convertCSV, convertJSON} = require("../backend_cemp/back");
const archiver = require('archiver');
const path = require('path');
const photosFolder = path.join(__dirname, '../backend_cemp/res_photo');
const csvFolder = path.join(__dirname, '../backend_cemp/res_csv');
const jsonFolder = path.join(__dirname, '../backend_cemp/res_json');
let photoUrl = [];
module.exports = function(app, db) {
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.get('/employee', (req, res) => {
        selectEmployee().then(AllDocuments => {
            console.log(AllDocuments)
            res.send(AllDocuments)
        }).catch(err => {
            console.error('Ошибка при подключении к базе данных:', err);
            res.status(500).send('Ошибка при подключении к базе данных');
        });
    });
    app.post('/employee', (req, res) => {
        deleteEmployeeAll();
        addEmployee().then(AllDocuments => {
            res.status(200);
            res.send(AllDocuments)
        }).catch(err => {
            console.error('Ошибка при подключении к базе данных:', err);
            res.status(500).send('Ошибка при подключении к базе данных');
        });
    });
    app.get('/download_photos', async (req, res) => {
        await getDataText('https://cemp.msk.ru/company/staff/').then(employeeList => {
            photoUrl = employeeList[1].slice();
        }).catch(error => {
            console.error(error);
        });
        await downloadAndSavePhotos(photoUrl);
        const archive = archiver('zip', {
            zlib: {level: 9}
        });
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=photos.zip');
        res.on('close', function () {
            console.log('Архив закрыт.');
        });
        archive.pipe(res);
        archive.directory(photosFolder, false);
        archive.finalize();
    });
    app.get('/convert_csv', async (req, res) => {
        await convertCSV();
        const archive = archiver('zip', {
            zlib: {level: 9}
        });
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=employee_csv.zip');
        res.on('close', function () {
            console.log('Архив закрыт.');
        });
        archive.pipe(res);
        archive.directory(csvFolder, false);
        archive.finalize();
    });
    app.get('/convert_json', async (req, res) => {
        await convertJSON();
        const archive = archiver('zip', {
            zlib: {level: 9}
        });
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=employee_json.zip');
        res.on('close', function () {
            console.log('Архив закрыт.');
        });
        archive.pipe(res);
        archive.directory(jsonFolder, false);
        archive.finalize();
    });
};