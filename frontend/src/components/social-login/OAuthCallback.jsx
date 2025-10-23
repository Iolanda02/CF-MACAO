import { Spinner, Container } from 'react-bootstrap';

function OAuthCallback () {
    return (
        <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Autenticazione in corso...</span>
        </Spinner>
        <p>Autenticazione in corso...</p>
        </Container>
    )
};

export default OAuthCallback;