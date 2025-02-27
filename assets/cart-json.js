class CartJson extends HTMLElement {
    constructor() {
      super();
      
      this.shippingProperties = ["_powder_room", "_single_vanity", "_double_vanity", "_xl_vanity", "_0_48", "_49_60", "_61_90", "91+"];
    }

    async connectedCallback() {
        this.cartJson = JSON.parse(this.textContent);
        if (!this.cartJson.items.length) return;

        for (const lineItem of this.cartJson.items) {
            if(Object.keys(lineItem.properties).length > 0) {
                await this.updateLineItem(lineItem);
            }
        }
    }

    async updateLineItem(lineItem) {
        const properties = { ...lineItem.properties };
        this.shippingProperties.forEach(prop => {
            if (prop in properties) {
              properties[prop] = `${lineItem.quantity}`;
            }
        });
        
        const data = {
            id: lineItem.key,
            quantity: lineItem.quantity,
            properties
        };

        try {
            const response = await fetch(`${routes.cart_change_url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }
}

customElements.define('cart-json', CartJson);