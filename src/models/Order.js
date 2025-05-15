const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    tableNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'delivered', 'completed'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Remove the pre-save logic that generated the orderId

// Create methods to format dates for display
orderSchema.methods.getFormattedDate = function() {
    const date = this.orderDate;
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

orderSchema.methods.getFormattedTime = function() {
    const date = this.orderDate;
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
