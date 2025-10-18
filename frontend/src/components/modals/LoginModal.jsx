import { Button, Modal } from "react-bootstrap";
import "./styles.css";


const LoginModal = ({ show, handleClose, onProceedAsGuest, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin();
        handleClose();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="login-modal-wrapper">
            <Modal.Header closeButton className="border-0 pb-0">
            </Modal.Header>
            <Modal.Body className="px-4 pt-0 pb-4 text-center">
                <h3 className="modal-title mb-4">Entra in Macao / Checkout</h3>

                <div className="guest-checkout-section mb-5">
                    <p className="section-subtitle mb-3 fw-bold">Come ospite</p>
                    <p className="text-muted mb-3">Acquista senza registrarti.</p>
                    <Button variant="dark" className="proceed-guest-button w-100 mb-4" onClick={() => { onProceedAsGuest(); handleClose(); }}>
                        PROCEDI COME OSPITE
                    </Button>
                </div>

                <div className="registered-user-section">
                    <p className="section-subtitle mb-3 fw-bold">Come utente registrato</p>

                    <p className="modal-subtitle mb-4 text-muted">Accedi con</p>

                    <div className="social-login-buttons d-grid gap-2 mb-4">
                        <Button variant="outline-secondary" className="social-button d-flex align-items-center justify-content-center">
                            <img src="" alt="Google" className="social-icon me-2" />
                            GOOGLE
                        </Button>
                    </div>

                    <div className="separator d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted">o</span>
                        <hr className="flex-grow-1" />
                    </div>

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3 text-start" controlId="formBasicEmail">
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

                        <Form.Group className="mb-3 text-start" controlId="formBasicPassword">
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

                        <Button variant="primary" type="submit" className="login-button mt-4 w-100">
                            ACCEDI
                        </Button>
                    </Form>
                </div>

                <div className="mt-5">
                    <span className="text-muted">Nuovo utente? </span>
                    <Button variant="link" className="register-link fw-bold">REGISTRATI</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LoginModal;