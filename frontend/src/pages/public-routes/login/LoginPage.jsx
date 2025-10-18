import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Form } from "react-router";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(
            JSON.stringify({ username, password })
        );
    };

    return (
        <>
            <h2 className='py-4'>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </Form.Group>
                <Button variant="dark" type="submit"
                    disabled={isLoading}>
                    {isLoading ? 'Accesso...' : 'Accedi'}
                </Button>
                <a
                    className="ms-3 btn btn-outline-dark"
                    href={import.meta.env.VITE_API_URL + '/auth/login-google'}
                >
                    Accedi con Google
                </a>
            </Form>
        </>
    )
}

export default LoginPage;