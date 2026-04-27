import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  // Categories
  const ovosh = await db.category.create({
    data: {
      name: 'Vegetables',
      nameUz: 'Sabzavotlar',
      icon: '🥕',
      sortOrder: 1,
      isActive: true,
    },
  })

  const mevalar = await db.category.create({
    data: {
      name: 'Fruits',
      nameUz: 'Mevalar',
      icon: '🍎',
      sortOrder: 2,
      isActive: true,
    },
  })

  const suxofruk = await db.category.create({
    data: {
      name: 'Dried Fruits',
      nameUz: 'Quritilgan mevalar',
      icon: '🥜',
      sortOrder: 3,
      isActive: true,
    },
  })

  const bodring = await db.category.create({
    data: {
      name: 'Greens',
      nameUz: 'Ko\'katlar',
      icon: '🥬',
      sortOrder: 4,
      isActive: true,
    },
  })

  // Vegetables
  await db.product.createMany({
    data: [
      { name: 'Potato', nameUz: 'Kartoshka', categoryId: ovosh.id, price: 4500, oldPrice: 5500, unit: 'kg', image: '/products/potato.jpg', stock: 500, isFeatured: true },
      { name: 'Onion', nameUz: 'Piyoz', categoryId: ovosh.id, price: 4000, oldPrice: 5000, unit: 'kg', image: '/products/onion.jpg', stock: 400, isFeatured: true },
      { name: 'Carrot', nameUz: 'Sabzi', categoryId: ovosh.id, price: 5000, oldPrice: 6000, unit: 'kg', image: '/products/carrot.jpg', stock: 300, isFeatured: true },
      { name: 'Tomato', nameUz: 'Pomidor', categoryId: ovosh.id, price: 8000, oldPrice: 10000, unit: 'kg', image: '/products/tomato.jpg', stock: 250, isFeatured: true },
      { name: 'Cucumber', nameUz: 'Bodring', categoryId: ovosh.id, price: 7000, oldPrice: 9000, unit: 'kg', image: '/products/cucumber.jpg', stock: 200 },
      { name: 'Cabbage', nameUz: 'Karam', categoryId: ovosh.id, price: 3500, oldPrice: 4500, unit: 'kg', image: '/products/cabbage.jpg', stock: 150 },
      { name: 'Pepper', nameUz: 'Qalampir', categoryId: ovosh.id, price: 12000, oldPrice: 15000, unit: 'kg', image: '/products/pepper.jpg', stock: 180 },
      { name: 'Eggplant', nameUz: 'Baqlajon', categoryId: ovosh.id, price: 9000, oldPrice: 11000, unit: 'kg', image: '/products/eggplant.jpg', stock: 120 },
      { name: 'Garlic', nameUz: 'Puch', categoryId: ovosh.id, price: 25000, oldPrice: 30000, unit: 'kg', image: '/products/garlic.jpg', stock: 100 },
      { name: 'Radish', nameUz: 'Rediska', categoryId: ovosh.id, price: 6000, oldPrice: 7500, unit: 'kg', image: '/products/radish.jpg', stock: 80 },
    ],
  })

  // Fruits
  await db.product.createMany({
    data: [
      { name: 'Apple', nameUz: 'Olma', categoryId: mevalar.id, price: 15000, oldPrice: 18000, unit: 'kg', image: '/products/apple.jpg', stock: 300, isFeatured: true },
      { name: 'Banana', nameUz: 'Banan', categoryId: mevalar.id, price: 18000, oldPrice: 22000, unit: 'kg', image: '/products/banana.jpg', stock: 250, isFeatured: true },
      { name: 'Orange', nameUz: 'Apelsin', categoryId: mevalar.id, price: 20000, oldPrice: 25000, unit: 'kg', image: '/products/orange.jpg', stock: 200, isFeatured: true },
      { name: 'Mandarin', nameUz: 'Mandarin', categoryId: mevalar.id, price: 22000, oldPrice: 28000, unit: 'kg', image: '/products/mandarin.jpg', stock: 180 },
      { name: 'Grapes', nameUz: 'Uzum', categoryId: mevalar.id, price: 25000, oldPrice: 30000, unit: 'kg', image: '/products/grapes.jpg', stock: 150 },
      { name: 'Pomegranate', nameUz: 'Anor', categoryId: mevalar.id, price: 18000, oldPrice: 22000, unit: 'kg', image: '/products/pomegranate.jpg', stock: 120 },
      { name: 'Pear', nameUz: 'Nok', categoryId: mevalar.id, price: 16000, oldPrice: 20000, unit: 'kg', image: '/products/pear.jpg', stock: 100 },
      { name: 'Lemon', nameUz: 'Limon', categoryId: mevalar.id, price: 30000, oldPrice: 35000, unit: 'kg', image: '/products/lemon.jpg', stock: 80 },
    ],
  })

  // Dried Fruits
  await db.product.createMany({
    data: [
      { name: 'Raisins', nameUz: 'Mayiz', categoryId: suxofruk.id, price: 45000, oldPrice: 55000, unit: 'kg', image: '/products/raisins.jpg', stock: 200, isFeatured: true },
      { name: 'Dried Apricot', nameUz: 'Quritilgan o\'rik', categoryId: suxofruk.id, price: 55000, oldPrice: 65000, unit: 'kg', image: '/products/dried-apricot.jpg', stock: 150, isFeatured: true },
      { name: 'Walnut', nameUz: 'Yong\'oq', categoryId: suxofruk.id, price: 80000, oldPrice: 95000, unit: 'kg', image: '/products/walnut.jpg', stock: 100 },
      { name: 'Almond', nameUz: 'Bodom', categoryId: suxofruk.id, price: 120000, oldPrice: 140000, unit: 'kg', image: '/products/almond.jpg', stock: 80 },
      { name: 'Dried Apple', nameUz: 'Quritilgan olma', categoryId: suxofruk.id, price: 40000, oldPrice: 50000, unit: 'kg', image: '/products/dried-apple.jpg', stock: 120 },
      { name: 'Dried Banana', nameUz: 'Quritilgan banan', categoryId: suxofruk.id, price: 50000, oldPrice: 60000, unit: 'kg', image: '/products/dried-banana.jpg', stock: 90 },
      { name: 'Pistachio', nameUz: 'Fiston', categoryId: suxofruk.id, price: 150000, oldPrice: 180000, unit: 'kg', image: '/products/pistachio.jpg', stock: 60 },
      { name: 'Dried Fig', nameUz: 'Anjir', categoryId: suxofruk.id, price: 65000, oldPrice: 80000, unit: 'kg', image: '/products/fig.jpg', stock: 70 },
    ],
  })

  // Greens
  await db.product.createMany({
    data: [
      { name: 'Dill', nameUz: 'Ukrop', categoryId: bodring.id, price: 3000, oldPrice: 4000, unit: 'dona', image: '/products/dill.jpg', stock: 200, isFeatured: true },
      { name: 'Cilantro', nameUz: 'Kashnich', categoryId: bodring.id, price: 3000, oldPrice: 4000, unit: 'dona', image: '/products/cilantro.jpg', stock: 180 },
      { name: 'Parsley', nameUz: 'Petrushka', categoryId: bodring.id, price: 2500, oldPrice: 3500, unit: 'dona', image: '/products/parsley.jpg', stock: 150 },
      { name: 'Green Onion', nameUz: 'Yashil piyoz', categoryId: bodring.id, price: 2000, oldPrice: 3000, unit: 'dona', image: '/products/green-onion.jpg', stock: 200 },
      { name: 'Spinach', nameUz: 'Ispanak', categoryId: bodring.id, price: 5000, oldPrice: 6500, unit: 'kg', image: '/products/spinach.jpg', stock: 100 },
      { name: 'Lettuce', nameUz: 'Salat', categoryId: bodring.id, price: 4000, oldPrice: 5000, unit: 'dona', image: '/products/lettuce.jpg', stock: 120 },
    ],
  })

  // Warehouses
  await db.warehouse.createMany({
    data: [
      { name: 'Chilonzor Ombori', address: 'Chilonzor ko\'chasi, 15-uy', district: 'Chilonzor', latitude: 41.2856, longitude: 69.2034 },
      { name: 'Mirzo Ulug\'bek Ombori', address: 'Mirzo Ulug\'bek ko\'chasi, 42-uy', district: 'Mirzo Ulug\'bek', latitude: 41.3342, longitude: 69.2807 },
      { name: 'Yunusobod Ombori', address: 'Yunusobod davlat aholi xizmatlari markazi', district: 'Yunusobod', latitude: 41.3448, longitude: 69.2674 },
      { name: 'Shayxontohur Ombori', address: 'Shayxontohur tuman, 8-uy', district: 'Shayxontohur', latitude: 41.2995, longitude: 69.2401 },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
