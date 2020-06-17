const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: './config/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON files
const bootcamp = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import into db
const importData = async () => {
    try {
        await Bootcamp.create(bootcamp);

        console.log('Data imported'.green.inverse);
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();

        console.log('Data destroyed'.red.inverse);
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

// to pass args to this funcs, to know if import or delete
// example in console:
// node seeder -i
if(process.argv[2] === '-i'){
    importData();
}else if(process.argv[2] === '-d'){
    deleteData();
}