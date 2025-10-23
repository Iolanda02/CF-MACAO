import { Outlet, Route, Routes } from "react-router";
import { Alert, Container, Spinner } from "react-bootstrap";

import { useAuth } from "./contexts/AuthContext";
import AdminRoutes from "./pages/admin-routes/AdminRoutes";
import ProtectedRoutes from "./pages/auth-routes/ProtectedRoutes";
import PublicNavbar from "./components/header/PublicNavbar";
import Footer from "./components/footer/Footer";
import AdminNavbar from "./components/header/AdminNavbar";
import HomePage from "./pages/public-routes/home/HomePage";
import ProductDetailsPage from "./pages/public-routes/product-details/ProductDetailsPage";
import CartPage from "./pages/public-routes/cart/CartPage";
import CheckoutPage from "./pages/public-routes/checkout/CheckoutPage";
import LoginPage from "./pages/public-routes/login/LoginPage";
import RegisterPage from "./pages/public-routes/register/RegisterPage";
import ProfilePage from "./pages/auth-routes/profile/ProfilePage";
import OrdersPage from "./pages/auth-routes/orders/OrdersPage";
import AdminDashboardPage from "./pages/admin-routes/admin-dashboard/AdminDashboardPage";
import AdminProductsListPage from "./pages/admin-routes/admin-products/AdminProductsListPage";
import AdminProductsFormPage from "./pages/admin-routes/admin-products/AdminProductsFormPage";
import AdminProductsViewPage from "./pages/admin-routes/admin-products/AdminProductsViewPage";
import AdminOrdersListPage from "./pages/admin-routes/admin-orders/AdminOrdersListPage";
import AdminOrdersFormPage from "./pages/admin-routes/admin-orders/AdminOrdersFormPage";
import AdminOrdersViewPage from "./pages/admin-routes/admin-orders/AdminOrdersViewPage";
import AdminUsersListPage from "./pages/admin-routes/admin-users/AdminUsersListPage";
import AdminUsersFormPage from "./pages/admin-routes/admin-users/AdminUsersFormPage";
import AdminUsersViewPage from "./pages/admin-routes/admin-users/AdminUsersViewPage";
import NotFoundPage from "./pages/public-routes/not-found/NotFoundPage";
import HelpPage from "./pages/public-routes/help/HelpPage";
import OAuthCallback from "./components/social-login/OAuthCallback";

function App() {

  const { isLoading, error } = useAuth();
  const oauthCallbackPath = import.meta.env.OAUTH_PATH_FRONTEND || '/oauth-callback';

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
        <p>Caricamento...</p>
      </Container>
    )
  }

  if (error) {
    // return (
    //   <Container className="mt-5">
    //     <Alert variant="danger">{error}</Alert>
    //   </Container>
    // );
  }

  return (
    <>
      <Routes>
        {/* Rotte pubbliche */}
        <Route path="/" element={<MainLayout />}> 
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path={oauthCallbackPath} element={<OAuthCallback />} />
          
          {/* Rotte protette */}
          <Route element={<ProtectedRoutes />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
        </Route>

        {/* Rotte Admin */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route element={<AdminLayout />} > 
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsListPage />} />
            <Route path="products/new" element={<AdminProductsFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductsFormPage />} />
            <Route path="products/:id" element={<AdminProductsViewPage />} />
            <Route path="orders" element={<AdminOrdersListPage />} />
            <Route path="orders/edit/:id" element={<AdminOrdersFormPage />} />
            <Route path="orders/:id" element={<AdminOrdersViewPage />} />
            <Route path="users" element={<AdminUsersListPage />} />
            <Route path="users/new" element={<AdminUsersFormPage />} />
            <Route path="users/edit/:id" element={<AdminUsersFormPage />} />
            <Route path="users/:id" element={<AdminUsersViewPage />} />
          </Route>
        </Route>

        {/* Rotta 404 - Pagina non trovata */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

const MainLayout = () => (
  <div>
    <PublicNavbar />
    <Container className='min-height-main-content'>
      <main>
        <Outlet />
      </main>
    </Container>
    <Footer />
  </div>
);

const AdminLayout = () => (
  <div>
    <AdminNavbar />
    <Container fluid className='min-height-admin-content mb-5'>
      <main>
        <Outlet />
      </main>
    </Container>
  </div>
);

export default App;
