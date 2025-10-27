import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Container, Image, ListGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { getUser } from "../../../api/user";
import { ArrowLeft, PencilFill } from "react-bootstrap-icons";
import "./styles.css";

function AdminUsersViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getUserDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
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
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/users")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/users")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
                <Alert variant="warning">Utente non trovato.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">

            <Button variant="link" onClick={() => navigate('/admin/users')} className="text-dark">
                <ArrowLeft className="me-2" />Torna alla lista utenti
            </Button>

            <div className="d-flex justify-content-between align-items-end my-3">
                <h1 className="m-0">Dettagli Utente: {user.fullName || `${user.firstName} ${user.lastName}`}</h1>
                <Button variant="outline-secondary" title="Modifica utente"
                    onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                >
                    <PencilFill />
                </Button>
            </div>

            <Card className="my-4">
                <Card.Body>
                    <Row className="mb-3 align-items-center">
                        <Col md={3} className="text-center">
                            <Image src={user.avatar?.url || 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg'} roundedCircle className="avatar-user" alt="Immagine Utente" />
                        </Col>
                        <Col md={9}>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="border-0"><strong>Nome:</strong> {user.firstName}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Cognome:</strong> {user.lastName}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Email:</strong> {user.email}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Ruolo:</strong> <span className={`badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}`}>{user.role}</span></ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Telefono:</strong> {user.phone || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Data di Nascita:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Registrato il:</strong> {new Date(user.createdAt).toLocaleDateString()} alle {new Date(user.createdAt).toLocaleTimeString()}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Ultimo Aggiornamento:</strong> {new Date(user.updatedAt).toLocaleDateString()} alle {new Date(user.updatedAt).toLocaleTimeString()}</ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                    <h5 className="mt-4 mb-3 border-top pt-3">Indirizzo di Spedizione</h5>
                    {user.shippingAddress ? (
                        <>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="border-0"><strong>Indirizzo:</strong> {user.shippingAddress.address || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Città:</strong> {user.shippingAddress.city || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>CAP:</strong> {user.shippingAddress.postalCode || 'N/A'}</ListGroup.Item>
                                <ListGroup.Item className="border-0"><strong>Paese:</strong> {user.shippingAddress.country || 'N/A'}</ListGroup.Item>
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