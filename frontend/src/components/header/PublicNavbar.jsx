import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'react-bootstrap';
import logo from "../../assets/logo.png";
import "./styles.css";
import LoginModal from '../modals/LoginModal';
import { useState } from 'react';


function PublicNavbar() {
    const { isAuthenticated, authUser, login, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const navigate = useNavigate();

    const handleShowLoginModal = () => setShowLoginModal(true);
    const handleCloseLoginModal = () => setShowLoginModal(false);

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <img className="blog-navbar-brand" alt="logo" src={logo} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="w-100 d-flex align-items-center">
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <div className='d-flex'>
                                <Nav.Link as={NavLink} to="/">
                                    Prodotti
                                </Nav.Link>
                                {(authUser?.role === 'user' || authUser?.role === 'admin') && <Nav.Link as={NavLink} to="/cart">
                                    Carrello
                                </Nav.Link>}
                                {authUser?.role === 'admin' && <Nav.Link as={NavLink} to="/admin">
                                    Pannello di amministrazione
                                </Nav.Link>}
                            </div>
                            {isAuthenticated ? (
                                    <div className='d-flex align-items-center'>
                                        <Nav.Link as={NavLink} onClick={logout}>
                                            Logout
                                        </Nav.Link>
                                        <Nav.Link as={NavLink} to={`/orders`}>
                                            Storico ordini
                                        </Nav.Link>
                                        <Nav.Link as={NavLink} to={`/profile`}>
                                            {authUser?.firstName} {authUser?.lastName}
                                        </Nav.Link>
                                        <Image className="avatar" src={authUser?.avatar?.path} roundedCircle />
                                    </div>
                            ) : (
                                <div className='d-flex justify-content-end w-100'>
                                    <Nav.Link as={NavLink} to="/">
                                        Register
                                    </Nav.Link>
                                    <Nav.Link onClick={handleShowLoginModal}>
                                        Login
                                    </Nav.Link>
                                </div>
                            )}
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
            
            <LoginModal
                show={showLoginModal}
                handleClose={handleCloseLoginModal}
                onProceedAsGuest={() => {
                    handleAddToCart(); 
                }}
                onLogin={async (email, password) => {
                    try {
                        await login({email, password}); 
                        navigate("/");
                    } catch (loginError) {
                        console.error("Errore durante il login dalla modale:", loginError);
                    }
                }}
            />
        </Navbar>
    );
}

export default PublicNavbar;