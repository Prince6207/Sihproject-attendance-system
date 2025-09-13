import mongoose  from "mongoose";

const tweetsSchema = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'User',
        default : null
    },
    content : {
        type : String,
        required : true ,
    }
})

const Tweets = mongoose.model('Tweets',tweetsSchema)

export default Tweets;