import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Badge, Dropdown, Image } from 'react-bootstrap';
import logo from "../../assets/logo.png";
import "./styles.css";
import LoginModal from '../modals/LoginModal';
import { useEffect, useRef, useState } from 'react';
import RegisterModal from '../modals/RegistrerModal';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { BoxArrowRight, BoxSeam, CartFill, Gear, Person, Speedometer } from 'react-bootstrap-icons';
import { registerApi } from '../../api/authentication';


function PublicNavbar() {
    const { isAuthenticated, authUser, login, logout, handleSocialLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navbarRef = useRef(null);
    const { addToast } = useToast();
    const { cartItemCount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 0;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    useEffect(() => {
        if (navbarRef.current) {
            const navbarElement = navbarRef.current;

            const updatePadding = () => {
                const navbarHeight = navbarElement.offsetHeight;
                document.body.style.paddingTop = `${navbarHeight}px`;
                // console.log('Navbar Height (after transition):', navbarHeight, 'Padding Top:', navbarHeight);
            };

            updatePadding();

            navbarElement.addEventListener('transitionend', updatePadding);

            return () => {
                navbarElement.removeEventListener('transitionend', updatePadding);
            };
        }
    }, [scrolled]);

        
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const jwt = queryParams.get('jwt');
        const error = queryParams.get('error');
        
        const oauthCallbackPath = import.meta.env.OAUTH_PATH_FRONTEND || '/oauth-callback';

        if (location.pathname === oauthCallbackPath) {
            if (jwt) {
                handleSocialLogin(jwt);
                navigate('/', { replace: true });
            } else if (error) {
                console.error("Errore durante il login social:", error);
                addToast("Errore durante il login social", "danger");
            }
        }
    }, [location, navigate, handleSocialLogin]);

    const handleShowLogin = () => {
        setShowRegisterModal(false); // Chiudi la modale di registrazione se aperta
        setShowLoginModal(true);
    };
    const handleCloseLogin = () => setShowLoginModal(false);

    const handleShowRegister = () => {
        setShowLoginModal(false); // Chiudi la modale di login se aperta
        setShowRegisterModal(true);
    };
    const handleCloseRegister = () => setShowRegisterModal(false);

    const handleLogin = async (email, password) => {
        try {
            await login({email, password});
            setShowLoginModal(false);
        } catch (loginError) {
            console.error("Errore durante il login dalla modale:", loginError);
            throw new Error(loginError)
        }
    }

    const handleRegister = async (firstName, lastName, email, password) => {
        try {
            await registerApi({
                firstName, 
                lastName, 
                email, 
                password
            });
            setShowRegisterModal(false);
            addToast("Registrazione avvenuta con successo!")
        } catch (loginError) {
            console.error("Errore durante il login dalla modale:", loginError);
            throw new Error(loginError)
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActiveProducts = location.pathname === '/' ;

    return (
        <Navbar expand="lg" className={`bg-dark navbar-dark ${scrolled ? 'scrolled' : ''}`} fixed='top' ref={navbarRef}>
            <Container>
                <Navbar.Brand as={Link} to="/" key="navbar-brand">
                    <img className={`blog-navbar-brand ${scrolled ? 'scrolled-logo' : ''}`} alt="logo" src={logo} />
                    {/* <span className="ms-2 app-brand-text">Caffè Macao</span> */}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" key="navbar-toggle" />
                <Navbar.Collapse id="basic-navbar-nav">
                     {/* Voci di Navigazione Centrali */}
                    <Nav className="mx-auto">
                        <Nav.Link as={NavLink} to="/" className={`menu-nav-link ${isActiveProducts ? 'active' : ''}`}>
                            Prodotti
                        </Nav.Link>
                    </Nav>

                    {/* Voci a Destra */}
                    <Nav className="d-flex align-items-center">
                        {/* Carrello */}
                        {(authUser?.role === 'user' || authUser?.role === 'admin') && (
                            <Nav.Link as={NavLink} to="/cart" className="position-relative me-3">
                                <CartFill size={22} />
                                {cartItemCount > 0 && (
                                    <Badge pill bg="danger" className="pill-items position-absolute top-0 start-100 translate-middle">
                                        {cartItemCount}
                                        <span className="visually-hidden">elementi nel carrello</span>
                                    </Badge>
                                )}
                            </Nav.Link>
                        )}

                        {/* Pannello di Amministrazione (se admin) */}
                        {authUser?.role === 'admin' && (
                            <Nav.Link as={NavLink} to="/admin" className="d-flex flex-column align-items-center admin-panel-link me-3">
                                <Speedometer size={20} />
                                <small className="mt-1">Admin</small>
                            </Nav.Link>
                        )}

                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle as={Nav.Link} className="p-0 user-avatar-toggle">
                                    { authUser?.avatar?.url && <Image
                                        className="avatar"
                                        src={authUser?.avatar?.url}
                                        alt="Immagine utente"
                                        roundedCircle
                                    />}
                                    <span className="ms-2 d-none d-lg-inline">{authUser?.firstName} {authUser?.lastName}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Header className="text-center bg-light py-3">
                                        <Image
                                            src={authUser?.avatar?.url}
                                            roundedCircle
                                            width="60"
                                            height="60"
                                            className="mb-2 avatar big"
                                            alt="Avatar dell'utente"
                                        />
                                        <h6>{authUser?.firstName} {authUser?.lastName}</h6>
                                        <small className="text-muted">{authUser?.email}</small>
                                    </Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} to={`/profile`}>
                                        <Person className="me-2" /> Profilo
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to={`/orders`}>
                                        <BoxSeam className="me-2" /> I miei ordini
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                                        <BoxArrowRight className="me-2" /> Esci
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            // Se non autenticato: Login/Register
                            <>
                                <Nav.Link onClick={handleShowRegister} key="nav-link-register" className="btn btn-ligth-outline ms-2 px-3 py-2 rounded-pill">
                                    Registrati
                                </Nav.Link>
                                <Nav.Link onClick={handleShowLogin} key="nav-link-login" className="btn btn-ligth-outline ms-2 px-3 py-2 rounded-pill">
                                    Accedi
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
            
            
            <LoginModal
                show={showLoginModal}
                handleClose={handleCloseLogin}
                onLogin={handleLogin}
                onSwitchToRegister={handleShowRegister}
            />

            <RegisterModal
                show={showRegisterModal}
                handleClose={handleCloseRegister}
                onRegister={handleRegister}
                onSwitchToLogin={handleShowLogin}
            />
        </Navbar>
    );
}

export default PublicNavbar;