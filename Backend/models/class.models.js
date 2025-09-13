import mongoose from "mongoose"

//create a student schema witha ll details like attendance markesd

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    }]
})
const Class = mongoose.model('Class', classSchema)
export default Class;