const generateCartId =()=>{
    return 'cart_' + Date.now() + Math.random().toString(36).substring(2,5);

};
export const getOrCreateCartId =()=>{
    let cartId = localStorage.getItem('cartId');
    if(!cartId){
        cartId = generateCartId();
        localStorage.setItem('cartId', cartId);

    }
    return cartId;
};