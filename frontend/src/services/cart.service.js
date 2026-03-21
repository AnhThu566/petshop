class CartService {
    constructor() {
        this.storageKey = "accessory_cart";
    }

    getCart() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (error) {
            return [];
        }
    }

    saveCart(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
    }

    addToCart(accessory, quantity = 1) {
        const cart = this.getCart();

        const existingIndex = cart.findIndex(
            (item) => String(item.id) === String(accessory._id || accessory.id)
        );

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: accessory._id || accessory.id,
                maPhuKien: accessory.maPhuKien,
                name: accessory.name,
                price: accessory.price,
                image: accessory.image || "",
                stock: accessory.quantity ?? 0,
                quantity,
            });
        }

        this.saveCart(cart);
        return cart;
    }

    updateQuantity(id, quantity) {
        const cart = this.getCart().map((item) => {
            if (String(item.id) === String(id)) {
                return {
                    ...item,
                    quantity: quantity < 1 ? 1 : quantity,
                };
            }
            return item;
        });

        this.saveCart(cart);
        return cart;
    }

    removeItem(id) {
        const cart = this.getCart().filter(
            (item) => String(item.id) !== String(id)
        );
        this.saveCart(cart);
        return cart;
    }

    clearCart() {
        localStorage.removeItem(this.storageKey);
    }
}

export default new CartService();