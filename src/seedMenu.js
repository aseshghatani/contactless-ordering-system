const mongoose = require('mongoose');
require("./db/conn"); // Use your existing MongoDB connection
const MenuItem = require('./models/menuItem');

// Sample menu items
const menuItems = [
  {
    name: 'Bruschetta',
    description: 'Grilled bread rubbed with garlic and topped with olive oil, salt, tomato, and herbs.',
    price: 8.99,
    category: 'appetizer',
    isVegetarian: true
  },
  {
    name: 'Garlic Bread',
    description: 'Fresh baked bread with garlic butter and herbs.',
    price: 5.99,
    category: 'appetizer',
    isVegetarian: true
  },
  {
    name: 'Buffalo Wings',
    description: 'Spicy chicken wings served with blue cheese dip.',
    price: 10.99,
    category: 'appetizer'
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon, grilled to perfection with lemon herb butter.',
    price: 22.99,
    category: 'main',
    isSpecial: true
  },
  {
    name: 'Mushroom Risotto',
    description: 'Creamy Italian rice with sautéed wild mushrooms and parmesan cheese.',
    price: 18.99,
    category: 'main',
    isVegetarian: true
  },
  {
    name: 'Filet Mignon',
    description: '8oz premium beef tenderloin with red wine reduction.',
    price: 29.99,
    category: 'main',
    isSpecial: true
  },
  {
    name: 'Chocolate Mousse',
    description: 'Rich and creamy chocolate dessert topped with whipped cream.',
    price: 7.99,
    category: 'dessert',
    isVegetarian: true
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.',
    price: 8.99,
    category: 'dessert',
    isVegetarian: true
  },
  {
    name: 'House Wine',
    description: 'Glass of our premium house wine, red or white.',
    price: 6.99,
    category: 'beverage'
  },
  {
    name: 'Craft Beer',
    description: 'Selection of local craft beers.',
    price: 5.99,
    category: 'beverage'
  },
  {
    name: 'Fresh Juice',
    description: 'Freshly squeezed seasonal fruits.',
    price: 4.99,
    category: 'beverage',
    isVegetarian: true
  }
];

// Delete existing items and insert new ones
const seedDB = async () => {
  try {
    await MenuItem.deleteMany({});
    console.log('Menu items deleted');
    
    await MenuItem.insertMany(menuItems);
    console.log('Menu items added successfully');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();