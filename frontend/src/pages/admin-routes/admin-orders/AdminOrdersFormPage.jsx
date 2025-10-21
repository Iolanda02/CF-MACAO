import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { getOrderById, updateOrder } from "../../../api/order";
import { ArrowLeft, Save } from "react-bootstrap-icons";

function AdminOrdersFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    
    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        } else {
            setLoading(false);
            navigate('/404', {replace: true})
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response =  await getOrderById(id);
            setOrder(response.data);
        } catch (err) {
            console.error("Errore fetch dettagli ordine:", err);
            setError("Non è stato possibile recuperare i dati dell'ordine. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Gestione campi annidati come shippingAddress.address
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setOrder(prevOrder => ({
                ...prevOrder,
                [parent]: {
                ...prevOrder[parent],
                [child]: value
                }
            }));
        } else {
            setOrder(prevOrder => ({
                ...prevOrder,
                [name]: value
            }));
        }
        setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };
    
    const validateForm = () => {
        let errors = {};
        if (!order.orderStatus) errors.orderStatus = "Lo stato dell'ordine è obbligatorio.";
        if (!order.paymentStatus) errors.paymentStatus = "Lo stato del pagamento è obbligatorio.";
        // Altre validazioni
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert("Si prega di correggere gli errori nel modulo.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const dataToSend = {
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                notes: order.notes,
                discountAmount: order.discountAmount,
                discountCode: order.discountCode,
                shippingCost: (
                    order.shippingCost.amount || order.shippingCost.currency) ? order.shippingCost : undefined,
                shippingAddress: (
                    order.user?.shippingAddress?.address || order.user?.shippingAddress?.city || order.user?.shippingAddress?.postalCode || order.user?.shippingAddress?.country) ? order.user?.shippingAddress : undefined
            }

            await updateOrder(id, dataToSend);
            alert("Ordine aggiornato con successo!");
            navigate('/admin/orders');
        } catch (err) {
            console.error("Errore aggiornamento ordine:", err.response?.data || err.message);
            const apiErrorMessage = err.response?.data?.message || "Impossibile salvare l'ordine.";
            setError(apiErrorMessage);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors || {});
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento dati utente...</span>
                </Spinner>
                <p>Caricamento dati utente...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    if (!order) return <Container className="mt-5">
                            <Alert variant="info">Ordine non trovato.</Alert>
                        </Container>;

    return (
        <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Modifica Ordine: {order.orderNumber}</h1>
            <Link to="/admin/orders">
            <Button variant="secondary">
                <ArrowLeft className="me-2" />
                Torna agli Ordini
            </Button>
            </Link>
        </div>

        <Form onSubmit={handleSubmit}>
            <Card className="mb-4">
            <Card.Header as="h5">Stato Ordine e Pagamento</Card.Header>
            <Card.Body>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Stato Ordine</Form.Label>
                    <Form.Select
                        name="orderStatus"
                        value={order.orderStatus}
                        onChange={handleChange}
                        isInvalid={!!formErrors.orderStatus}
                    >
                        <option value="Pending">In Sospeso</option>
                        <option value="Processing">In Elaborazione</option>
                        <option value="Shipped">Spedito</option>
                        <option value="Delivered">Consegnato</option>
                        <option value="Cancelled">Annullato</option>
                        <option value="Returned">Restituito</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{formErrors.orderStatus}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Stato Pagamento</Form.Label>
                    <Form.Select
                        name="paymentStatus"
                        value={order.paymentStatus}
                        onChange={handleChange}
                        isInvalid={!!formErrors.paymentStatus}
                    >
                        <option value="Pending">In Sospeso</option>
                        <option value="Paid">Pagato</option>
                        <option value="Failed">Fallito</option>
                        <option value="Refunded">Rimborsato</option>
                        <option value="Partially Refunded">Parzialmente Rimborsato</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{formErrors.paymentStatus}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                </Row>
                {order.orderStatus === 'Cancelled' && (
                <Form.Group className="mb-3">
                    <Form.Label>Motivo Cancellazione</Form.Label>
                    <Form.Control
                    as="textarea"
                    rows={3}
                    name="cancellationReason"
                    value={order.cancellationReason || ''}
                    onChange={handleChange}
                    isInvalid={!!formErrors.cancellationReason}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.cancellationReason}</Form.Control.Feedback>
                </Form.Group>
                )}
            </Card.Body>
            </Card>

            <Card className="mb-4">
            <Card.Header as="h5">Informazioni Spedizione e Note</Card.Header>
            <Card.Body>
                <h5>Indirizzo di Spedizione</h5>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Via</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.address"
                        value={order.shippingAddress?.address || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.address']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.address']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Numero Civico</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.addressNumber"
                        value={order.shippingAddress?.addressNumber || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.addressNumber']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.addressNumber']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                    <Form.Label>Città</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.city"
                        value={order.shippingAddress?.city || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.city']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.city']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                    <Form.Label>CAP</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.postalCode"
                        value={order.shippingAddress?.postalCode || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.postalCode']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.postalCode']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                    <Form.Label>Provincia</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.province"
                        value={order.shippingAddress?.province || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.province']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.province']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                </Row>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Nazione</Form.Label>
                    <Form.Control
                        type="text"
                        name="shippingAddress.country"
                        value={order.shippingAddress?.country || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['shippingAddress.country']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.country']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Numero di Telefono</Form.Label>
                    <Form.Control
                        type="text"
                        name="user.phone"
                        value={order.user?.phone || ''}
                        onChange={handleChange}
                        isInvalid={!!formErrors['user.phone']}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors['user.phone']}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                </Row>

                <Form.Group className="mb-3">
                <Form.Label>Costo di Spedizione</Form.Label>
                <Form.Control
                    type="number"
                    name="shippingCost.amount"
                    value={order.shippingCost?.amount || 0}
                    onChange={handleChange}
                    isInvalid={!!formErrors['shippingCost.amount']}
                />
                <Form.Control.Feedback type="invalid">{formErrors['shippingCost.amount']}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={order.notes || ''}
                    onChange={handleChange}
                    isInvalid={!!formErrors.notes}
                />
                <Form.Control.Feedback type="invalid">{formErrors.notes}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Codice Sconto</Form.Label>
                <Form.Control
                    type="text"
                    name="discountCode"
                    value={order.discountCode || ''}
                    onChange={handleChange}
                    isInvalid={!!formErrors.discountCode}
                />
                <Form.Control.Feedback type="invalid">{formErrors.discountCode}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Ammontare Sconto</Form.Label>
                <Form.Control
                    type="number"
                    name="discountAmount"
                    value={order.discountAmount || 0}
                    onChange={handleChange}
                    isInvalid={!!formErrors.discountAmount}
                />
                <Form.Control.Feedback type="invalid">{formErrors.discountAmount}</Form.Control.Feedback>
                </Form.Group>

            </Card.Body>
            </Card>
            
            <Card className="mb-4">
            <Card.Header as="h5">Dettagli Ordine</Card.Header>
            <Card.Body>
                <p><strong>N. Ordine:</strong> {order.orderNumber}</p>
                <p><strong>Totale:</strong> {order.totalAmount?.toFixed(2)} {order.currency}</p>
                <p><strong>Sottototale:</strong> {order.subtotal?.toFixed(2)} {order.currency}</p>
                <h6>Prodotti:</h6>
                <ul>
                {order.items?.map(item => (
                    <li key={item.item + item.variant}>{item.productName} ({item.variant.name}) - {item.quantity} x {item.price.amount?.toFixed(2)} {item.price.currency}</li>
                ))}
                </ul>
            </Card.Body>
            </Card>

            <div className="d-flex flex-items-center gap-3 mt-3 mb-5">
                <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> : <Save className="me-2" />}
                Salva Modifiche
                </Button>
                <Button variant="outline-primary" type="submit" 
                    disabled={submitting} 
                    onClick={() => navigate(-1)}
                >
                    Annulla
                </Button>
            </div>
        </Form>
        </Container>
    )
}

export default AdminOrdersFormPage;