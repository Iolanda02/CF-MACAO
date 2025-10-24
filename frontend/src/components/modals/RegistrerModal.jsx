import { Button, Form, InputGroup, Modal, Alert } from "react-bootstrap";
import { useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import { registerApi } from "../../api/authentication";
import logoGoogle from "/google.svg";
import "./styles.css";


const RegisterModal = ({ show, handleClose, onRegister, onSwitchToLogin }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await registerApi({firstName, lastName, email, password});
            onSwitchToLogin();
        } catch (err) {
            setError(err.response?.data?.message || "Errore durante la registrazione. Riprova.");
            console.error("Errore durante la registrazione:", err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const handleModalClose = () => {
        // Reset degli stati al momento della chiusura della modale
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setError(null);
        setLoading(false);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered className="register-modal-wrapper">
            <Modal.Header closeButton className="border-0 pb-0">
            </Modal.Header>
            <Modal.Body className="px-4 pt-0 pb-4 text-center">
                <h3 className="modal-title mb-3">Registrati a Macao</h3>

                {error && <Alert variant="danger">{error}</Alert>}
                
                <p className="modal-subtitle mb-3 text-muted">Registrati con</p>

                <div className="social-login-buttons d-grid gap-2 mb-3">
                    <Button variant="outline-secondary" className="social-button d-flex align-items-center justify-content-center">
                        <img src={logoGoogle} alt="Google" className="social-icon me-2" />
                        GOOGLE
                    </Button>
                </div>

                <div className="separator d-flex align-items-center my-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-3 text-muted">o</span>
                    <hr className="flex-grow-1" />
                </div>

                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3 text-start" controlId="formFirstName">
                        <Form.Label srOnly>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="form-control-custom"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formLastName">
                        <Form.Label srOnly>Cognome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Cognome"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="form-control-custom"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formRegisterEmail">
                        <Form.Label srOnly>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control-custom"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formRegisterPassword">
                        <Form.Label srOnly>Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control-custom"
                            />
                            <Button variant="outline-secondary" onClick={togglePasswordVisibility} className="password-toggle-button">
                                {showPassword ? <EyeFill /> : <EyeSlashFill />}
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <Button variant="dark" type="submit" className="register-button mt-3 w-100"
                        disabled={!firstName || !lastName || !email || !password || loading}
                    >
                        {loading ? 'REGISTRAZIONE...' : 'REGISTRATI'}
                    </Button>
                </Form>

                <div className="separator mt-4">
                    <hr className="flex-grow-1" />
                    <span className="text-muted">Hai già un account? </span>
                    <Button variant="link" className="login-link fw-bold" onClick={onSwitchToLogin}>ACCEDI</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default RegisterModal;