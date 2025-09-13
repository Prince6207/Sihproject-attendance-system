import mongoose from "mongoose"

//create a student schema witha ll details like attendance markesd

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacherId: {
        type: String,
        required: true,
        unique: true
    },
    class: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Class',
        required: true
    }],
    attendance: {
        type: Map,
        of: Boolean
    },
})
const teacher = mongoose.model('Teacher', teacherSchema)

export default teacher;