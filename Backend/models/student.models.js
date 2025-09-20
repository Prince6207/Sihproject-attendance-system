import mongoose from "mongoose"

//create a student schema witha ll details like attendance markesd

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    sclass: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    studentMail :{
        type: String,
        required: true,
        unique: true
    },
    attendance: {
        type: Map,
        of: Boolean
    },
    avatar :{
        type: String ,
        required : true ,
        default : "#"
    }
})
const Student = mongoose.model('Student', studentSchema)

export default Student;