import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/home'
import Catalog from './pages/catalog'
import Nav from './pages/nav'
import Order from './pages/orders/order'
import BookDetails from './pages/book'
import Cart from './pages/orders/cart'
import Admin from './pages/administration/admin'
import OrderConfirmation from './pages/orders/OrderConfirmation'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/administration/Login'
import { CartProvider } from './components/cart/CartContext'

function App() {
  return (
    <CartProvider>
      <div>
        <Toaster position="top-right" />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/order" element={<Order />} />
          <Route path="/book/:id" element={<BookDetails/>}/>
          <Route path="/cart" element={<Cart />} />
          <Route path='/admin' element={
            <ProtectedRoute>
              <Admin /> 
            </ProtectedRoute>
          } />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/admin/login" element={<Login />} />
        </Routes>
      </div>
    </CartProvider>
  )
}

export default App
