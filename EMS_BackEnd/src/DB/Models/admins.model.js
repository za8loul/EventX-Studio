import mongoose from "mongoose";

// Create Admins Schema
const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: [25, "First Name must be at most 25 length"],
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        maxLength: [25, "Last Name must be at most 25 length"],
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: [18, "Age must be at least 18 years old"],
        max: [100, "Age must be at most 100 years old"]
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
            name: "idx_email_unique"
        }
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    virtuals: {
        fullName: {
            get() {
                return `${this.firstName} ${this.lastName}`
            }
        }
    },
    methods: {
        getFullName() {
            return `${this.firstName} ${this.lastName}`
        },
    }
})

// Create Admin model
const Admin = mongoose.model("Admin", AdminSchema)

export default Admin;