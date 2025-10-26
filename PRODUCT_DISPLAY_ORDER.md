# Product Display Order Control

## Overview
You can now control the exact order in which products are displayed on your frontend using the `displayOrder` field.

## How It Works

### 1. Database Field
- Added `displayOrder` field to the Product model
- Type: Number (default: 0)
- Indexed for fast queries
- Lower numbers appear first (1, 2, 3, etc.)

### 2. Seed Script
Products in `seedProducts.js` are automatically assigned display order based on their position in the `PRODUCT_SETS` array:
- First product in array → displayOrder: 1
- Second product → displayOrder: 2
- And so on...

### 3. API Sorting
All product endpoints now sort by `displayOrder` first:
- `GET /api/products` - Main products list
- `GET /api/products/category/:category` - Category products

## How to Change Display Order

### Method 1: Reorder in Seed Script (Easiest)
Simply rearrange products in the `PRODUCT_SETS` array:

```javascript
const PRODUCT_SETS = [
  {
    name: 'Premium Tea Ceremony Set', // This will be displayOrder: 1
    // ...
  },
  {
    name: 'Artisan Geometric Bowl Set', // This will be displayOrder: 2
    // ...
  },
  // etc...
];
```

Then run: `node scripts/seedProducts.js`

### Method 2: Set Custom Display Order
Add a `displayOrder` property directly in the seed data:

```javascript
const PRODUCT_SETS = [
  {
    name: 'Artisan Geometric Bowl Set',
    displayOrder: 5, // Custom order
    // ...
  },
  {
    name: 'Heritage Enamel Bowl Set',
    displayOrder: 1, // Will appear first
    // ...
  },
];
```

Then update the `getProductSets()` function to use it:

```javascript
function getProductSets() {
  return PRODUCT_SETS.map((set, index) => ({
    name: set.name,
    description: set.description,
    price: Math.round(set.rateAfterDiscount),
    countInStock: set.countInStock,
    category: set.category,
    image: set.image,
    images: set.images,
    items: set.items,
    displayOrder: set.displayOrder || (index + 1) // Use custom or auto-increment
  }));
}
```

### Method 3: Update via Admin API (Future Enhancement)
You can create an admin endpoint to update display order:

```javascript
// PUT /api/admin/products/:id/display-order
router.put('/products/:id/display-order', protect, adminOnly, async (req, res) => {
  const { displayOrder } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { displayOrder },
    { new: true }
  );
  res.json(product);
});
```

## Current Display Order
Based on your current `PRODUCT_SETS` array:

1. Artisan Geometric Bowl Set
2. Heritage Enamel Bowl Set
3. Ultimate Dining Collection
4. Spa Bathroom Essentials Set
5. Premium Wine Glass & Candle Set
6. Premium Tea Ceremony Set
7. Natural Coconut Glass Set
8. Premium Lid Container Set
9. Versatile Breakfast Bowl
10. Elegant Mini Bowl Duo

## Tips
- **Keep gaps**: Use displayOrder like 10, 20, 30 instead of 1, 2, 3 to make it easier to insert products later
- **Featured products**: Consider adding a separate `featured` boolean field for homepage highlights
- **Category-specific ordering**: You can have different display orders per category
- **Zero values**: Products with displayOrder: 0 will appear last

## Frontend Usage
Products will automatically appear in the correct order when fetched from the API. No frontend changes needed!
