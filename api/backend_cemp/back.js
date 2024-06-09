const axios = require('axios');
const cheerio = require('cheerio');
const urlModule = require('url');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Employee = require('./dto/employee');
let re = new RegExp(String.fromCharCode(160), "g");
let listId = [];
let employeeList = [];
const photoURLs = [];
const outputDirectory = path.join(__dirname, 'res_photo');
const outputDirectoryJSON = path.join(__dirname, 'res_json');
const outputDirectoryCSV = path.join(__dirname, 'res_csv');
const jsonFilePath = path.join(outputDirectoryJSON, 'employee.json');
const csvFilePath = path.join(outputDirectoryCSV, 'employee.csv');
async function getDataText(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const depatmentList = [];
        const ids = new Set();
        let newListFullName = [];
        let newListPosition = [];

        $('.content h2').each((index, element) => {
            depatmentList.push($(element).text().replace(re, " "));
        });

        $('.content').each((index, element) => {
            const employeeFullName = $(element).find('.item');
            employeeFullName.each((index, element) => {
                const fullId = $(element).attr('id');
                if (fullId) {
                    const id = fullId.split('_');
                    ids.add(id[1]);
                }
            });
        })
        listId = Array.from(ids);
        for (let i = 0; i < listId.length; i++) {
            newListFullName.push(getInfoEmployee(listId[i], $, '.item-title'));
            newListPosition.push(getInfoEmployee(listId[i], $, '.semibold'));

        }

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < newListFullName[i].length; j++){
                employeeList.push(new Employee(newListFullName[i][j], newListPosition[i][j], depatmentList[i]))
            }
        }

        for (let i = 0; i < listId.length; i++) {
            $('.item[id*="_' + listId[i] + '_"]').each((index, element) => {
                const employeeFullName = $(element).find('.item-img');
                employeeFullName.each((index, element) => {
                    const photoURL = $(element).find('img').attr('src');
                    if (photoURL) {
                        const absolutePhotoURL = urlModule.resolve(url, photoURL);
                        photoURLs.push(absolutePhotoURL);
                    }
                });

            })
        }
        return [employeeList, photoURLs];
    } catch (error) {
        console.error(error);
        throw new Error('Failed to extract subheadings');
    }
}

function getInfoEmployee(id, $, className) {
    try {
        const infoList = [];

        $('.item[id*="_' + id + '_"]').each((index, element) => {
            const employeeinfo = $(element).find(className);
            if (employeeinfo.length > 0) {
                employeeinfo.each((index, el) => {
                    const text = $(el).text().replace(re, " ");
                    infoList.push(text);
                });
            } else {
                infoList.push('');
            }
        })
        return infoList
    } catch (error) {
        console.error(error);
        throw new Error('Failed to extract subheadings');
    }
}

async function downloadAndSavePhotos(urls) {
    await getDataText('https://cemp.msk.ru/company/staff/');
    deleteAllFilesInDirectory(outputDirectory);
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const filename = ''+ employeeList[i].fullName.split(' ')[0] + '.jpg';
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = path.join(outputDirectory, filename);
            fs.writeFileSync(filePath, response.data, 'binary');
            console.log(`Фотография ${filename} сохранена в папку res.`);
        } catch (error) {
            console.error(`Ошибка при сохранении фотографии ${url}: ${error}`);
        }
    }
}
function deleteAllFilesInDirectory(directoryPath) {
    fs.readdirSync(directoryPath).forEach(file => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
            deleteAllFilesInDirectory(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });
}

async function convertJSON() {
    await getDataText('https://cemp.msk.ru/company/staff/');
    const jsonEmployee = JSON.stringify(employeeList);
    fs.writeFileSync(jsonFilePath, jsonEmployee);
}
async function convertCSV() {
    await getDataText('https://cemp.msk.ru/company/staff/');
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'fullName', title: 'FULL NAME'},
            {id: 'position', title: 'POSITION'},
            {id: 'department', title: 'DEPARTMENT'}
        ]
    });
    csvWriter.writeRecords(employeeList)
        .then(() => console.log(`CSV файл сохранен по пути: ${csvFilePath}`))
        .catch(error => console.error(`Ошибка при записи CSV файла: ${error}`));
}

// async function getData() {
//     deleteAllFilesInDirectory(outputDirectory);
//     await getDataText('https://cemp.msk.ru/company/staff/');
//     await downloadAndSavePhotos(photoURLs);
//     convertJSON();
//     convertCSV();
// }
//downloadAndSavePhotos(photoURLs);
//convertCSV();
//convertJSON();

// getDataText('https://cemp.msk.ru/company/staff/').then(employeeList => {
//     console.log(employeeList);
// }).catch(error => {
//     console.error(error);
// });


module.exports = {getDataText, downloadAndSavePhotos, convertCSV, convertJSON};