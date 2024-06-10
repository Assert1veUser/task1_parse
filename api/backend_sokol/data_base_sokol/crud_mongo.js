const {MongoClient: MongoClient} = require('mongodb')
const MongoDBclient = new MongoClient('mongodb://admin:admin@task1_parse-mongo-1:27017')
const { ObjectId } = require('mongodb');
let employee = [];
const selectEmployeeSokol = async () =>{
    try {
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        const [result_select_medicine] = await Promise.all([MongoDBclient
            .db('sokol_employee')
            .collection('employee_sokol')
            .find()
            .toArray()]);
        await MongoDBclient.close()
        return result_select_medicine
    } catch (e) {
        console.log(e)
    }
}
const addEmployeeSokol = async () =>{
    try {
        const {getDataText} = require('../back_sokol')
        await getDataText('https://sokol-rostov.ru/doctors/').then(employeeList => {
            employee = employeeList[0].slice();
        }).catch(error => {
            console.error(error);
        });
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        await Promise.all([MongoDBclient
            .db('sokol_employee')
            .collection('employee_sokol')
            .insertMany(employee)]);
        await MongoDBclient.close()
        return "Данные добавлены"
    } catch (e) {
        console.log(e)
    }
}
const deleteEmployeeAllSokol = async () =>{
    try {
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        await Promise.all([MongoDBclient
            .db('sokol_employee')
            .collection('employee_sokol').deleteMany()]);
        await MongoDBclient.close()
        return "Данные удалены"
    } catch (e) {
        console.log(e)
    }
}
module.exports = {addEmployeeSokol, selectEmployeeSokol, deleteEmployeeAllSokol}