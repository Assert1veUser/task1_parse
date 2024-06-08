const {MongoClient: MongoClient} = require('mongodb')
const MongoDBclient = new MongoClient('mongodb://admin:admin@task1_parse-master-mongo-1:27017')
const { ObjectId } = require('mongodb');
let employee = [];
const selectEmployee = async () =>{
    try {
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        const [result_select_medicine] = await Promise.all([MongoDBclient
            .db('cemp_employee')
            .collection('employee')
            .find()
            .toArray()]);
        await MongoDBclient.close()
        return result_select_medicine
    } catch (e) {
        console.log(e)
    }
}
const addEmployee = async () =>{
    try {
        const {getDataText} = require('../back')
        await getDataText('https://cemp.msk.ru/company/staff/').then(employeeList => {
            employee = employeeList[0].slice();
        }).catch(error => {
            console.error(error);
        });
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        await Promise.all([MongoDBclient
            .db('cemp_employee')
            .collection('employee')
            .insertMany(employee)]);
        await MongoDBclient.close()
        return "Данные добавлены"
    } catch (e) {
        console.log(e)
    }
}
const deleteEmployeeAll = async () =>{
    try {
        await MongoDBclient.connect()
        console.log("Успешно подключились к базе данных")
        await Promise.all([MongoDBclient
            .db('cemp_employee')
            .collection('employee').deleteMany()]);
        await MongoDBclient.close()
        return "Данные удалены"
    } catch (e) {
        console.log(e)
    }
}
module.exports = {addEmployee, selectEmployee, deleteEmployeeAll}