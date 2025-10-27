import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { getOrderById, updateOrder } from "../../../api/order";
import { ArrowLeft, Save } from "react-bootstrap-icons";
import { useToast } from "../../../contexts/ToastContext";

function AdminOrdersFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const { addToast } = useToast();

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
            setError("Non è stato possibile recuperare i dettagli dell'ordine. Riprova più tardi.");
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
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setMessage({ type: 'danger', text: 'Si prega di correggere gli errori nella pagina.' });
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
                    order.shippingCost.amount || order.shippingCost.currency) ? order.shippingCost : null,
                shippingAddress: (
                    order.user?.shippingAddress?.address || order.user?.shippingAddress?.city || order.user?.shippingAddress?.postalCode || order.user?.shippingAddress?.country) ? order.user?.shippingAddress : null
            }

            await updateOrder(id, dataToSend);
            addToast("Ordine aggiornato con successo!", "success");
            navigate('/admin/orders');
        } catch (err) {
            console.error("Errore aggiornamento ordine:", err.response?.data || err.message);
            setMessage("Impossibile salvare l'ordine. Riprova più tardi.");
            addToast("Salvataggio non riuscito", "danger");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento ordine...</span>
                </Spinner>
                <p>Caricamento ordine...</p>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/orders")} className="mb-3 text-dark">
                    <ArrowLeft className="me-2" />Torna alla lista ordini
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/orders")} className="mb-3 text-dark">
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
                <Alert variant="warning">Ordine non trovato.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            
            <div className="d-flex justify-content-between align-items-center">
                <Button variant="link" onClick={() => navigate("/admin/orders")} className="mb-3 text-dark">
                    <ArrowLeft className="me-2" />Torna alla lista ordini
                </Button>
            </div>
            <h1 className="mb-4">Modifica Ordine: {order.orderNumber}</h1>
            
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                {message.text}
                </Alert>
            )}

        <Form onSubmit={handleSubmit} noValidate>
            <Card className="my-4">
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
                                disabled={submitting}
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
                                disabled={submitting}
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
                    {/* {order.orderStatus === 'Cancelled' && (
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
                    )} */}
                </Card.Body>
            </Card>

            <Card className="my-4">
                <Card.Header as="h5">Informazioni Spedizione e Note</Card.Header>
                <Card.Body>
                    {/* <h5>Indirizzo di Spedizione</h5> */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                            <Form.Label>Indirizzo</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.address"
                                value={order.shippingAddress?.address || ''}
                                onChange={handleChange}
                                disabled={submitting}
                                isInvalid={!!formErrors['shippingAddress.address']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.address']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                            <Form.Label>Città</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.city"
                                value={order.shippingAddress?.city || ''}
                                onChange={handleChange}
                                disabled={submitting}
                                isInvalid={!!formErrors['shippingAddress.city']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.city']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                            <Form.Label>CAP</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.postalCode"
                                value={order.shippingAddress?.postalCode || ''}
                                onChange={handleChange}
                                disabled={submitting}
                                isInvalid={!!formErrors['shippingAddress.postalCode']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.postalCode']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        {/* <Col md={4}>
                            <Form.Group className="mb-3">
                            <Form.Label>Provincia</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.province"
                                value={order.shippingAddress?.province || ''}
                                onChange={handleChange}
                                disabled={submitting}
                                isInvalid={!!formErrors['shippingAddress.province']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.province']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col> */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                            <Form.Label>Nazione</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.country"
                                value={order.shippingAddress?.country || ''}
                                onChange={handleChange}
                                disabled={submitting}
                                isInvalid={!!formErrors['shippingAddress.country']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['shippingAddress.country']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col >
                            <Form.Group className="mb-3">
                            <Form.Label>Numero di Telefono</Form.Label>
                            <Form.Control
                                type="text"
                                name="order.phone"
                                value={order.phone || ''}
                                onChange={handleChange}
                                isInvalid={!!formErrors['order.phone']}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors['order.phone']}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* <Form.Group className="mb-3">
                        <Form.Label>Costo di Spedizione</Form.Label>
                        <Form.Control
                            type="number"
                            name="shippingCost.amount"
                            value={order.shippingCost?.amount || 0}
                            onChange={handleChange}
                            onWheel={(e) => e.currentTarget.blur()}
                            isInvalid={!!formErrors['shippingCost.amount']}
                        />
                        <Form.Control.Feedback type="invalid">{formErrors['shippingCost.amount']}</Form.Control.Feedback>
                    </Form.Group> */}

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

                    {/* <Form.Group className="mb-3">
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
                        onWheel={(e) => e.currentTarget.blur()}
                        isInvalid={!!formErrors.discountAmount}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.discountAmount}</Form.Control.Feedback>
                    </Form.Group> */}

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
                        {order.items?.map((item, index) => (
                            <li key={index}>{item.productName} ({item.variantName}) - {item.quantity} x {item.price.amount?.toFixed(2)} {item.price.currency}</li>
                        ))}
                    </ul>
                </Card.Body>
            </Card>

            <div className="d-flex flex-items-center gap-3 mt-4">
                <Button variant="secondary" type="submit" disabled={submitting}>
                {submitting ? 
                (
                    <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        {"Salvataggio..."}
                    </>
                ) : (
                    <>
                        <Save className="me-2" />
                        {"Salva Modifiche"}
                    </>
                )}
                </Button>
                <Button variant="outline-secondary"
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