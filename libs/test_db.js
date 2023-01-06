require('./database')

test_data = { "id": 1, "name": 'pat', "surname": 'tk' }

test = async() => {
    const students = await updateDB("test2", {studentName: "patsakorn2"}, "studentID= 63209010016");
    console.log(students)
}

test()