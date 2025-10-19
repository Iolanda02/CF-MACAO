import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'react-bootstrap';
import logo from "../../assets/logo.png";
import "./styles.css";


function Navbar() {
    const { isAuthenticated, authUser, logout } = useAuth();

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
                                {authUser?.role === 'user' && <Nav.Link as={NavLink} to="/cart">
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
                                        <Nav.Link as={NavLink} to={`/profile`}>
                                            {authUser?.nome} {authUser?.cognome}
                                        </Nav.Link>
                                        <Image className="avatar" src={authUser?.avatar?.path} roundedCircle />
                                    </div>
                            ) : (
                                <div className='d-flex justify-content-end w-100'>
                                    <Nav.Link as={NavLink} to="/register">
                                        Register
                                    </Nav.Link>
                                    <Nav.Link as={NavLink} to="/login">
                                        Login
                                    </Nav.Link>
                                </div>
                            )}
                        </div>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navbar;