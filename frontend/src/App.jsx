import { Route, Routes } from "react-router";
import { Container } from "react-bootstrap";

import { useAuth } from "./contexts/AuthContext";
import AdminRoutes from "./pages/admin-routes/AdminRoutes";
import ProtectedRoutes from "./pages/auth-routes/ProtectedRoutes";
import HomePage from "./pages/public-routes/home/HomePage";
import ProductDetailsPage from "./pages/public-routes/product-details/ProductDetailsPage";
import CartPage from "./pages/public-routes/cart/CartPage";
import CheckoutPage from "./pages/public-routes/checkout/CheckoutPage";
import LoginPage from "./pages/public-routes/login/LoginPage";
import RegisterPage from "./pages/public-routes/register/RegisterPage";
import ProfilePage from "./pages/auth-routes/profile/ProfilePage";
import OrdersPage from "./pages/auth-routes/orders/OrdersPage";
import AdminDashboardPage from "./pages/admin-routes/admin-dashboard/AdminDashboardPage";
import AdminProductsPage from "./pages/admin-routes/admin-products/AdminProductsPage";
import AdminOrdersPage from "./pages/admin-routes/admin-orders/AdminOrdersPage";
import AdminUsersPage from "./pages/admin-routes/admin-users/AdminUsersPage";
import NotFoundPage from "./pages/public-routes/not-found/NotFoundPage";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

function App() {

  const { isLoading } = useAuth();
  if (isLoading) {
      return <div>Caricamento App...</div>;
  }

  return (
    <>
      <Routes>
        {/* Rotte pubbliche */}
        <Route path="/" element={<MainLayout />} />
        <Route index element={<HomePage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Rotte protette */}
        <Route element={<ProtectedRoutes />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* Rotte Admin */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Rotta 404 - Pagina non trovata */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

const MainLayout = () => (
  <div>
    <Header />
    <Container className='min-height-main-content'>
      <main>
        <Outlet />
      </main>
    </Container>
    <Footer />
  </div>
);

export default App;
