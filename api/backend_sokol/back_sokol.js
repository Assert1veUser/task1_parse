const axios = require("axios");
const cheerio = require("cheerio");
const urlModule = require("url");
const Employee = require("../backend_cemp/dto/employee");
const url = 'https://sokol-rostov.ru/doctors/';
let re = new RegExp(String.fromCharCode(160), "g");
let fullnameList = []
let postList = []
let specializationList = []
let employeeList = []


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

        for (let i = 1; i <= countPage; i++) {
            const new_url = `${url}?PAGEN_1=${i}`;
            try {
                response = await axios.get(new_url);
                $ = cheerio.load(response.data);
                await getInfoEmployee($);
            } catch (error) {
                console.error(`Ошибка при загрузке страницы ${new_url}: ${error}`);
            }
        }

        response = await axios.get(url);
        $ = cheerio.load(response.data);

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < newListFullName[i].length; j++){
                employeeList.push(new Employee(newListFullName[i][j], newListPosition[i][j], depatmentList[i]))
            }
        }
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
            const employeeFullName = $(element).find('.team-item');
            const employeePost = $(element).find('.team-item');
            employeeFullName.each((index, element) => {
                const name = $(element).find('.team-item__name');
                if (name.length > 0) {
                    name.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        fullnameList.push(text);
                    });
                }
            });
            employeePost.each((index, element) => {
                const itemPost = $(element).find('.team-item__post');
                if (itemPost.length > 0) {
                    itemPost.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        postList.push(text);
                    });
                }
            });
            employeePost.each((index, element) => {
                const itemSpecialization = $(element).find('.team-item__specialization');
                if (itemSpecialization.length > 0) {
                    itemSpecialization.each((index, el) => {
                        const text = $(el).text().replace(re, " ");
                        specializationList.push(text.trim().replace(/\s+/g, ' '));
                    });
                }
            });
            // team-item__experience
            // employeePost.each((index, element) => {
            //     const itemExperience = $(element).find('.team-item__specialization');
            //     if (itemSpecialization.length > 0) {
            //         itemSpecialization.each((index, el) => {
            //             const text = $(el).text().replace(re, " ");
            //             specializationList.push(text.trim().replace(/\s+/g, ' '));
            //         });
            //     }
            // });
        });
    } catch (error) {
        console.error(`Ошибка при загрузке страницы`);
        return null;
    }
}

getDataText(url);