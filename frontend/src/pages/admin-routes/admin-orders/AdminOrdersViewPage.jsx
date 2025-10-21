import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { getOrderById } from "../../../api/order";
import { ArrowLeft } from "react-bootstrap-icons";

function AdminOrdersViewPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getOrderDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(false);
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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate("/admin/orders")} className="mt-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
            </Container>
        );
    }

    if (!order) return <Container className="mt-5">
                            <Alert variant="info">Ordine non trovato.</Alert>
                        </Container>;

    // Formattazione delle date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Dettagli Ordine: {order.orderNumber}</h1>
            <Link to="/admin/orders">
            <Button variant="secondary">
                <ArrowLeft className="me-2" />
                Torna agli Ordini
            </Button>
            </Link>
        </div>

        <Card className="my-4">
            <Card.Header as="h5">Informazioni Generali</Card.Header>
            <Card.Body>
            <Row>
                <Col md={6}>
                <p><strong>N. Ordine:</strong> {order.orderNumber}</p>
                <p><strong>Data Ordine:</strong> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</p>
                <p><strong>Ultimo Aggiornamento:</strong> {new Date(order.updatedAt).toLocaleDateString()} {new Date(order.updatedAt).toLocaleTimeString()}</p>
                <p><strong>Cliente:</strong> {order.user?.email || 'N/A'} (ID: {order.user?._id || 'N/A'})</p>
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
            {order.shippingAddress ? (
                <>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p><strong>Telefono:</strong> {order.user.phone? order.user.phone : 'N/A'}</p>
                </>
            ) : (
                <p>Nessun indirizzo di spedizione specificato.</p>
            )}
            </Card.Body>
        </Card>

        <Card className="mb-4">
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
                        <strong>{item.productName}</strong>{item.variantName? (' - '+ item.variant?.name): ('')}
                        <br />
                        <small>SKU: {item.variant?.sku}</small>
                    </Col>
                    <Col md={2}>Quantità: {item.quantity}</Col>
                    <Col md={2}>Prezzo Unitario: {item.price.amount?.toFixed(2)} {item.price.currency}</Col>
                    <Col md={2}>Totale: {(item.price.amount * item.quantity)?.toFixed(2)} {item.price.currency}</Col>
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