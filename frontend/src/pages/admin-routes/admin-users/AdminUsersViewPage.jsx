import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Image, ListGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { getUser } from "../../../api/user";
import { ArrowLeft, PencilSquare } from "react-bootstrap-icons";

function AdminUsersViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getUserDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(false);
            const result = await getUser(id);
            setUser(result.data);
        } catch(error) {
            console.error(error);
            setError("Non è stato possibile recuperare i dati dell'utente. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            getUserDetails(id);
        }
    }, [id, getUserDetails]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento utente...</span>
                </Spinner>
                <p>Caricamento utente...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate("/admin/users")} className="mt-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">Utente non trovato.</Alert>
                <Button variant="secondary" onClick={() => navigate("/admin/users")} className="mt-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="secondary" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
                <Button variant="info" onClick={() => navigate(`/admin/users/edit/${user._id}`)}>
                    <PencilSquare className="me-2" />Modifica Utente
                </Button>
            </div>

            <h1 className="mb-4">Dettagli Utente: {user.fullName || `${user.firstName} ${user.lastName}`}</h1>

            <Card className="my-4">
                <Card.Body>
                    <Row className="mb-3 align-items-center">
                        <Col md={3} className="text-center">
                            <Image src={user.avatar?.url || 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg'} roundedCircle style={{ width: '120px', height: '120px', objectFit: 'cover' }} alt="Avatar Utente" />
                        </Col>
                        <Col md={9}>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Nome:</strong> {user.firstName}</ListGroup.Item>
                                <ListGroup.Item><strong>Cognome:</strong> {user.lastName}</ListGroup.Item>
                                <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
                                <ListGroup.Item><strong>Ruolo:</strong> <span className={`badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}`}>{user.role}</span></ListGroup.Item>
                                <ListGroup.Item><strong>Telefono:</strong> {user.phone || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item><strong>Data di Nascita:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}</ListGroup.Item>
                                <ListGroup.Item><strong>Registrato il:</strong> {new Date(user.createdAt).toLocaleDateString()} alle {new Date(user.createdAt).toLocaleTimeString()}</ListGroup.Item>
                                <ListGroup.Item><strong>Ultimo Aggiornamento:</strong> {new Date(user.updatedAt).toLocaleDateString()} alle {new Date(user.updatedAt).toLocaleTimeString()}</ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                    <h5 className="mt-4 mb-3 border-top pt-3">Indirizzo di Spedizione</h5>
                    {user.shippingAddress ? (
                        <>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Via:</strong> {user.shippingAddress.address}</ListGroup.Item>
                                <ListGroup.Item><strong>Città:</strong> {user.shippingAddress.city}</ListGroup.Item>
                                <ListGroup.Item><strong>CAP:</strong> {user.shippingAddress.postalCode}</ListGroup.Item>
                                <ListGroup.Item><strong>Paese:</strong> {user.shippingAddress.country}</ListGroup.Item>
                            </ListGroup>
                        </>
                    ) : (
                        <span>{'N/A'}</span>
                    )}
                </Card.Body>
            </Card>
        </Container>
    )
}

export default AdminUsersViewPage;