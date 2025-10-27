import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { getOrderById } from "../../../api/order";
import { ArrowLeft, PencilFill } from "react-bootstrap-icons";

function AdminOrdersViewPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getOrderDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await getOrderById(id);
            setOrder(result.data);
        } catch(error) {
            console.error(error);
            setError("Non è stato possibile recuperare i dati dell'ordine. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            getOrderDetails(id);
        }
    }, [id, getOrderDetails]);

    
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

    // Formattazione delle date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };
                        
    if (error) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/orders")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista ordini
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/orders")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
                <Alert variant="warning">Ordine non trovato.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            
            <Button variant="link" onClick={() => navigate('/admin/orders')} className="text-dark">
                <ArrowLeft className="me-2" />Torna alla lista ordini
            </Button>
            
            <div className="d-flex justify-content-between align-items-end my-3">
                <h1 className="m-0">Dettagli Ordine: {order.orderNumber}</h1>
                <Button variant="outline-secondary" title="Modifica ordine"
                    onClick={() => navigate(`/admin/orders/edit/${order._id}`)}
                >
                    <PencilFill />
                </Button>
            </div>

            <Card className="my-4">
                <Card.Header as="h5">Informazioni Generali</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <p><strong>N. Ordine:</strong> {order.orderNumber}</p>
                            <p><strong>Data Ordine:</strong> {formatDate(order.orderDate)}</p>
                            <p><strong>Ultimo Aggiornamento:</strong> {formatDate(order.updatedAt)}</p>
                            <p><strong>Cliente:</strong> {order.user?.email || 'N/A'}</p>
                            <p><strong>Metodo Pagamento:</strong> {order.paymentMethod || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Stato Pagamento:</strong> <span className={`badge bg-${
                                order.paymentStatus === 'Paid' ? 'success' :
                                order.paymentStatus === 'Pending' ? 'warning' :
                                order.paymentStatus === 'Failed' ? 'danger' : 'info'
                            }`}>{order.paymentStatus}</span></p>
                            <p><strong>Stato Ordine:</strong> <span className={`badge bg-${
                                order.orderStatus === 'Delivered' ? 'success' :
                                order.orderStatus === 'Shipped' ? 'info' :
                                order.orderStatus === 'Cancelled' ? 'danger' : 'secondary'
                            }`}>{order.orderStatus}</span></p>
                            <p><strong>Totale:</strong> {order.totalAmount?.toFixed(2)} {order.currency}</p>
                            <p><strong>Sottototale:</strong> {order.subtotal?.toFixed(2)} {order.currency}</p>
                            <p><strong>Costo Spedizione:</strong> {order.shippingCost?.amount?.toFixed(2)} {order.shippingCost?.currency}</p>
                            {order.discountAmount > 0 && <p><strong>Sconto:</strong> -{order.discountAmount?.toFixed(2)} {order.currency} ({order.discountCode})</p>}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header as="h5">Indirizzo di Spedizione</Card.Header>
                <Card.Body>
                    <p><strong>Indirizzo: </strong>
                        {order.shippingAddress ? (
                            <>
                                <span>{order.shippingAddress.address || ''}</span>
                                {order.shippingAddress.city && (
                                    <span>, {order.shippingAddress.city}</span>
                                )} 
                                {order.shippingAddress.postalCode && (
                                    <span>, {order.shippingAddress.postalCode}</span>
                                )}
                                {order.shippingAddress.country && (
                                    <span>, {order.shippingAddress.country}</span>
                                )}
                            </>
                        ) : (
                            <p>Nessun indirizzo di spedizione specificato.</p>
                        )}
                    </p>
                    <p><strong>Telefono:</strong> {order.phone? order.phone : 'N/A'}</p>
                </Card.Body>
            </Card>

            <Card className="my-4">
                <Card.Header as="h5">Prodotti Ordinati</Card.Header>
                <ListGroup variant="flush">
                {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                    <ListGroup.Item key={index}>
                        <Row className="align-items-center">
                        <Col md={1}>
                            {item.variantImageUrl?.url && (
                            <img src={item.variantImageUrl.url} alt={item.productName} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            )}
                        </Col>
                        <Col md={5}>
                            <strong>{item.productName}</strong>
                            {item.variantName && (
                                <p className="m-0">{item.variantName}</p>
                            )}
                            <small className="text-muted">SKU: {item.variant?.sku}</small>
                        </Col>
                        <Col md={2}>Quantità: {item.quantity ? 
                            (<span><b>{item.quantity}</b></span>) : (<span>N/A</span>)}</Col>
                        <Col md={2}>Prezzo Unitario: {item.price.amount?.toFixed(2)} {item.price.currency}</Col>
                        <Col md={2}>Totale: <b>{(item.price.amount * item.quantity)?.toFixed(2)} {item.price.currency}</b></Col>
                        </Row>
                    </ListGroup.Item>
                    ))
                ) : (
                    <ListGroup.Item>Nessun prodotto in questo ordine.</ListGroup.Item>
                )}
                </ListGroup>
            </Card>

            {order.notes && (
                <Card className="mb-4">
                <Card.Header as="h5">Note</Card.Header>
                <Card.Body><p>{order.notes}</p></Card.Body>
                </Card>
            )}

            {order.cancellationReason && order.orderStatus === 'Cancelled' && (
                <Card className="mb-4">
                <Card.Header as="h5">Motivo Cancellazione</Card.Header>
                <Card.Body><p>{order.cancellationReason}</p></Card.Body>
                </Card>
            )}

        </Container>
    )
}

export default AdminOrdersViewPage;