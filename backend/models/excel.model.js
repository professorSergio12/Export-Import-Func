import mongoose from 'mongoose';

const excelSchema = new mongoose.Schema({
    MKT:{
        type: String,
    },
    SERIES:{
        type: String,
    },
    SYMBOL:{
        type: String,
    },
    SECURITY:{
        type: String,
    },
    CLOSE_PRICE:{
        type: String,
    },
    DATE:{
        type: String,
    },
    ISIN:{
        type: String,
    }
})

const Excel = mongoose.model('Excel', excelSchema);

export default Excel;   