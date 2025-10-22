import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import "./styles.css";
import { useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";


const LoginModal = ({ show, handleClose, onProceedAsGuest, onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onLogin(email, password);
            handleClose();
        } catch (err) {
            setError(err.message || "Credenziali non valide. Riprova.");
            console.error("Errore durante il login:", err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const handleModalClose = () => {
        console.log("handleModalClose");
        if(error) {
            return;
        }
        setEmail('');
        setPassword('');
        setError(null);
        setLoading(false);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered className="login-modal-wrapper">
            <Modal.Header closeButton className="border-0 pb-0">
            </Modal.Header>
            <Modal.Body className="px-4 pt-0 pb-4 text-center">
                <h3 className="modal-title mb-3">Entra in Macao</h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {/* <div className="guest-checkout-section mb-5">
                    <p className="section-subtitle mb-3 fw-bold">Come ospite</p>
                    <Button variant="dark" className="proceed-guest-button w-100 mb-4" onClick={() => { onProceedAsGuest(); handleClose(); }}>
                        PROCEDI COME OSPITE
                    </Button>
                </div> */}

                <div className="registered-user-section">
                    {/* <p className="section-subtitle mb-3 fw-bold">Come utente registrato</p> */}

                    <p className="modal-subtitle mb-3 text-muted">Accedi con</p>

                    <div className="social-login-buttons d-grid gap-2 mb-3">
                        <Button variant="outline-secondary" className="social-button d-flex align-items-center justify-content-center">
                            <img src="" alt="Google" className="social-icon me-2" />
                            GOOGLE
                        </Button>
                    </div>

                    <div className="separator d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted">o</span>
                        <hr className="flex-grow-1" />
                    </div>

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3 text-start" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control-custom"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 text-start" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
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

                        <Button variant="dark" type="submit" className="login-button mt-3 w-100"
                            disabled={!email || !password}
                        >
                            ACCEDI
                        </Button>
                    </Form>
                </div>

                <div className="separator mt-4">
                    <hr className="flex-grow-1" />
                    <span className="text-muted">Nuovo utente? </span>
                    <Button variant="link" className="register-link fw-bold" onClick={onSwitchToRegister}>REGISTRATI</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LoginModal;