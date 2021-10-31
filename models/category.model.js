const mongoose = require('mongoose');

//CREATING SCHEMA
const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    icon: {
        type: String,
    },
    color:{
        type: String,
    }
})

//To convert _id to simply id. For front-end friendly
categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
})

categorySchema.set('toJSON', {
    virtuals: true
})

//CREATING MODEL
exports.Category = mongoose.model('Category', categorySchema);