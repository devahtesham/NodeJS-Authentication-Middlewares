const mongoose = require("mongoose");
const schema = mongoose.Schema({
    // yahan schema men jo keys set hongi wohi exact uth kr DB pr jaaati hen
    name:{
        type:String,
        required:true    // means it is required otherwise DB throws an error
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    mobile_number:{ // DB pr hamaesha naming convention men snake case chlta hy tu hmen is cheez ka khayal rkhna hy k frontend se jo case bhi aaye hmen yahan snake case hi bhijwana hy 
        type:String,
        required:true
    },
    created_on:{ 
     // ye field ham pany schema men laazmi bnaty hen, iska faida ye hy k ye hamen wo exact wo date btaega jb koi user isy hit krraha hogaa, jis k zarye hem is data ko sorting wagera krwaskty hen, r bhi bohat se data ordering k kaam krsakty hen tu ye field rkhna must hy schema men
        type:Date,
        default:Date.now
    }

})

const userModel = mongoose.model("users",schema);
module.exports = userModel