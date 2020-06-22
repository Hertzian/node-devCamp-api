const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add a number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // relationship with Bootcamp model
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }
});

// Static method to get avg of course tuitions
// Statics in mongoose are a method declare directly in the model
// Do NOT use arrow functions for statics!
CourseSchema.statics.getAverageCost = async function(bootcampId){
    // console.log('Calculating avg cost...'.blue);

    const obj = await this.aggregate([
        // steps to the pipeline
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group:{
                _id: '$bootcamp',
                averageCost: {$avg: '$tuition'}
            }
        }
    ]);

    // console.log(obj);

    // To calculate avg cost and include in db to ALL courses, (in bootcamp model averageCost field)
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            // To get rid off decimals
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (err) {
        console.error(err);
    }
}

// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before save
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);

});

module.exports = mongoose.model('Course', CourseSchema);