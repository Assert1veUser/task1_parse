const axios = require("axios");
const cheerio = require("cheerio");
const url = 'https://sokol-rostov.ru/doctors/';
let re = new RegExp(String.fromCharCode(160), "g");
let fullnameList = [];
let postList = [];
let specializationList = [];
let employeeList = [];
let experienceList = [];
const photoURLs = [];
const EmployeeSokol = require('../backend_sokol/dto/employee_sokol');
const urlModule = require("url");
const path = require("path");
const fs = require("fs");
const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");
const outputDirectory = path.join(__dirname, 'res_photo');
const outputDirectoryJSON = path.join(__dirname, 'res_json');
const outputDirectoryCSV = path.join(__dirname, 'res_csv');
const jsonFilePath = path.join(outputDirectoryJSON, 'employee.json');
const csvFilePath = path.join(outputDirectoryCSV, 'employee.csv');



async function getDataText(url) {
    try {
        let response = await axios.get(url);
        let $ = cheerio.load(response.data);
        let countPage;
        await getTotalPages($)
            .then(totalPages => {
                if (totalPages) {
                    countPage = totalPages;
                } else {
                    console.log('Не удалось определить количество страниц.');
                }
            })
            .catch(error => console.error(error));
        await getInfoEmployee($);
        await getURLPhotoEmployee($);
        for (let i = 1; i <= countPage; i++) {
            const new_url = `${url}?PAGEN_1=${i}`;
            try {
                response = await axios.get(new_url);
                $ = cheerio.load(response.data);
                await getInfoEmployee($);
                await getURLPhotoEmployee($);
            } catch (error) {
                console.error(`Ошибка при загрузке страницы ${new_url}: ${error}`);
            }
        }
        for (let j = 0; j < fullnameList.length; j++){
            employeeList.push(new EmployeeSokol(fullnameList[j], postList[j], specializationList[j], experienceList[j]))
        }
        return [employeeList, photoURLs]
    } catch (error) {
        console.error(error);
        throw new Error('Failed to extract subheadings');
    }
}
async function getTotalPages($, baseUrl) {
    try {
        const paginationItems = $('.smt-pagination li:not(.smt-pagination__last):not(.smt-pagination__first)');
        const totalPages = paginationItems.length - 2;
        return totalPages;
    } catch (error) {
        console.error(`Ошибка при загрузке страницы ${baseUrl}: ${error}`);
        return null;
    }
}

async function getInfoEmployee($) {
    try {
        $('.col-md-4').each((index, element) => {
            const employeeFullInfo = $(element).find('.team-item');
            employeeFullInfo.each((index, element) => {
                const info = $(element).find('.team-item__name');
                if (info.length > 0) {
                    info.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        fullnameList.push(text);
                    });
                }
            });
            employeeFullInfo.each((index, element) => {
                const itemPost = $(element).find('.team-item__post');
                if (itemPost.length > 0) {
                    itemPost.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        postList.push(text);
                    });
                }
            });
            employeeFullInfo.each((index, element) => {
                const itemSpecialization = $(element).find('.team-item__specialization');
                if (itemSpecialization.length > 0) {
                    itemSpecialization.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        specializationList.push(text.trim().replace(/\s+/g, ' '));
                    });
                }
            });
            employeeFullInfo.each((index, element) => {
                const itemExperience = $(element).find('.team-item__experience');
                if (itemExperience.length > 0) {
                    itemExperience.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        experienceList.push(text.trim().replace(/\s+/g, ' '));
                    });
                }
            });
        });
    } catch (error) {
        console.error(`Ошибка при загрузке страницы`);
        return null;
    }
}
async function getURLPhotoEmployee($) {
    try {
        $('.col-md-4').each((index, element) => {
            const employeeURLPhoto = $(element).find('.team-item');
            employeeURLPhoto.each((index, element) => {
                const info = $(element).find('.team-item__img');
                info.each((index, element) => {
                    const photoURL = $(element).find('img').attr('src');
                    if (photoURL) {
                        const absolutePhotoURL = urlModule.resolve(url, photoURL);
                        photoURLs.push(absolutePhotoURL);
                    }
                })
            });
        });
    } catch (error) {
        console.error(`Ошибка при загрузке страницы`);
        return null;
    }
}
async function downloadAndSavePhotosSokol(urls) {
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
    await getDataText(url);
    const jsonEmployee = JSON.stringify(employeeList);
    fs.writeFileSync(jsonFilePath, jsonEmployee);
}
async function convertCSV() {
    await getDataText(url);
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'fullName', title: 'FULL NAME'},
            {id: 'post', title: 'POST'},
            {id: 'specialization', title: 'SPECIALIZATION'},
            {id: 'experience', title: 'EXPERIENCE'}
        ]
    });
    csvWriter.writeRecords(employeeList)
        .then(() => console.log(`CSV файл сохранен по пути: ${csvFilePath}`))
        .catch(error => console.error(`Ошибка при записи CSV файла: ${error}`));
}
// getDataText(url).then(employeeList => {
//     console.log(employeeList);
// }).catch(error => {
//     console.error(error);
// });
// downloadAndSavePhotosSokol(photoURLs);
// convertCSV();
// convertJSON();
module.exports = {getDataText, downloadAndSavePhotosSokol, convertCSV, convertJSON};