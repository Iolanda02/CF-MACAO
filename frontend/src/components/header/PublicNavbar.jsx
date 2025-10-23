import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Dropdown, Image } from 'react-bootstrap';
import logo from "../../assets/logo.png";
import "./styles.css";
import LoginModal from '../modals/LoginModal';
import { useEffect, useRef, useState } from 'react';
import RegisterModal from '../modals/RegistrerModal';


function PublicNavbar() {
    const { isAuthenticated, authUser, login, logout } = useAuth();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navbarRef = useRef(null);

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
            // navigate("/");
        } catch (loginError) {
            console.error("Errore durante il login dalla modale:", loginError);
            throw new Error(loginError)
        }
    }

    const handleRegister = async (firstName, lastName, email, password) => {
        console.log("Tentativo di registrazione con:", firstName, lastName, email, password);
        // Implementa la logica di registrazione qui
        return new Promise(resolve => setTimeout(resolve, 1000)); // Simula un'API call
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <Navbar expand="lg" className={`bg-secondary-subtle ${scrolled ? 'scrolled' : ''}`} fixed='top' ref={navbarRef}>
            <Container>
                <Navbar.Brand as={Link} to="/" key="navbar-brand">
                    <img className={`blog-navbar-brand ${scrolled ? 'scrolled-logo' : ''}`} alt="logo" src={logo} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" key="navbar-toggle" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="w-100 d-flex align-items-center">
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <div className='d-flex'>
                                <Nav.Link as={NavLink} to="/" key="nav-link-prodotti">
                                    Prodotti
                                </Nav.Link>
                                {(authUser?.role === 'user' || authUser?.role === 'admin') && <Nav.Link as={NavLink} to="/cart" key="nav-link-carrello">
                                    Carrello
                                </Nav.Link>}
                                {authUser?.role === 'admin' && <Nav.Link as={NavLink} to="/admin" key="nav-link-admin">
                                    Pannello di amministrazione
                                </Nav.Link>}
                            </div>
                            {isAuthenticated ? (
                                    <div className='d-flex align-items-center'  key="authenticated-user-section">
                                        <span className="me-2">
                                            {authUser?.firstName} {authUser?.lastName}
                                        </span>
                                        <Dropdown align="end"> 
                                            <Dropdown.Toggle as={Nav.Link} className="no-caret-dropdown-toggle p-0"> 
                                                <Image className="avatar" src={authUser?.avatar?.url}
                                                alt="Avatar dell'utente" roundedCircle />
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item as={Link} to={`/profile`}>
                                                    Profilo
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to={`/orders`}>
                                                    Storico ordini
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={handleLogout}>
                                                    Esci
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    // <div className='d-flex align-items-center'>
                                    //     <Nav.Link as={NavLink} onClick={logout}>
                                    //         Logout
                                    //     </Nav.Link>
                                    //     <Nav.Link as={NavLink} to={`/orders`}>
                                    //         Storico ordini
                                    //     </Nav.Link>
                                    //     <Nav.Link as={NavLink} to={`/profile`}>
                                    //         {authUser?.firstName} {authUser?.lastName}
                                    //     </Nav.Link>
                                    //     <Image className="avatar" src={authUser?.avatar?.url}
                                    //     alt="Avatar dell'utente" roundedCircle />
                                    // </div>
                            ) : (
                                <div className='d-flex justify-content-end w-100' key="guest-user-section">
                                    <Nav.Link onClick={handleShowRegister} key="nav-link-register">
                                        Register
                                    </Nav.Link>
                                    <Nav.Link onClick={handleShowLogin} key="nav-link-login">
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