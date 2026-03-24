const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please add a patient ID']
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    items: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: [true, 'Please add final amount']
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partially-Paid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Insurance'],
        default: 'Cash'
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date
}, { timestamps: true });

// Auto-generate invoiceId
invoiceSchema.pre('save', async function() {
    if (!this.invoiceId) {
        const lastInvoice = await this.constructor.findOne().sort({ createdAt: -1 });
        let nextNum = 1001;
        if (lastInvoice && lastInvoice.invoiceId) {
            const num = parseInt(lastInvoice.invoiceId.replace('INV-', ''));
            if (!isNaN(num)) nextNum = num + 1;
        }
        this.invoiceId = `INV-${nextNum}`;
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
