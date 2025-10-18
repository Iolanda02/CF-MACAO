import { Alert, Card, Image, Modal, Pagination } from "react-bootstrap";

// Componente per visualizzare i dettagli di un singolo ordine nella modale
const OrderDetailModal = ({ show, onHide, order }) => {
    if (!order) return null;

    // Funzione helper per formattare la data
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Dettagli Ordine #{order.orderNumber}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col md={6}>
                        <p><strong>Data Ordine:</strong> {formatDate(order.createdAt)}</p>
                        <p><strong>Stato Pagamento:</strong> {order.paymentStatus}</p>
                        <p><strong>Stato Ordine:</strong> {order.orderStatus}</p>
                    </Col>
                    <Col md={6}>
                        <p><strong>Totale:</strong> {order.totalAmount?.toFixed(2)} {order.currency}</p>
                        <p><strong>Metodo di Pagamento:</strong> {order.paymentMethod || 'Non specificato'}</p>
                        {order.notes && <p><strong>Note:</strong> {order.notes}</p>}
                    </Col>
                </Row>

                <h5 className="mt-4 mb-3">Articoli Ordinati</h5>
                {order.items && order.items.length > 0 ? (
                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th></th> {/* Per l'immagine */}
                                <th>Prodotto</th>
                                <th>Variante</th>
                                <th>Quantità</th>
                                <th>Prezzo Unitario</th>
                                <th>Subtotale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.item + item.variant}>
                                    <td className="text-center" style={{ width: '60px' }}>
                                        {item.variantImageUrl?.url ? (
                                            <Image
                                                src={item.variantImageUrl.url} 
                                                alt={item.variantImageUrl.altText || item.productName} 
                                                rounded 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <XLg size={24} className="text-muted" />
                                        )}
                                    </td>
                                    <td>{item.productName}</td>
                                    <td>{item.variantName || 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.amount?.toFixed(2)} {item.price.currency}</td>
                                    <td>{(item.price.amount * item.quantity)?.toFixed(2)} {item.price.currency}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="text-end">Costo Spedizione:</td>
                                <td>{order.shippingCost?.amount?.toFixed(2)} {order.shippingCost?.currency}</td>
                            </tr>
                            {order.discountAmount > 0 && (
                                <tr>
                                    <td colSpan="5" className="text-end">Sconto ({order.discountCode}):</td>
                                    <td>- {order.discountAmount?.toFixed(2)} {order.currency}</td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan="5" className="text-end"><strong>Totale Ordine:</strong></td>
                                <td><strong>{order.totalAmount?.toFixed(2)} {order.currency}</strong></td>
                            </tr>
                        </tfoot>
                    </Table>
                ) : (
                    <Alert variant="info">Nessun articolo trovato per questo ordine.</Alert>
                )}

                <h5 className="mt-4 mb-3">Indirizzo di Spedizione</h5>
                {order.shippingAddress ? (
                    <Card className="p-3">
                        <p className="mb-1">{order.shippingAddress.street}</p>
                        <p className="mb-1">{order.shippingAddress.zipCode} {order.shippingAddress.city}, {order.shippingAddress.province}</p>
                        <p className="mb-1">{order.shippingAddress.country}</p>
                    </Card>
                ) : (
                    <Alert variant="warning">Indirizzo di spedizione non disponibile.</Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Chiudi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};


function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { authUser } = useAuth();
    const ordersPerPage = 10;

    useEffect(() => {
        if (authUser?._id) {
            fetchOrders(authUser._id, currentPage, ordersPerPage);
        } else {
            setError("Utente non autenticato.");
            setLoading(false);
        }
    }, [authUser, currentPage]);

    const fetchOrders = async (userId, page, limit) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getUserOrders(userId, page, limit);
            setOrders(result.orders);
            setTotalPages(result.totalPages);
        } catch (err) {
            setError("Errore durante il recupero dello storico ordini.");
            console.error("Errore fetch ordini:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleViewDetails = async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            const fullOrderDetails = await getOrderById(orderId); 
            setSelectedOrder(fullOrderDetails);
            setShowDetailModal(true);
        } catch (err) {
            setError("Errore durante il caricamento dei dettagli dell'ordine.");
            console.error("Errore caricamento dettagli ordine:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedOrder(null);
    };

    // Funzione helper per formattare la data
    const formatDateForTable = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
                <p>Caricamento ordini...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Errore!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="order-history-root py-4">
            <Container>
                <h1 className="mb-4">Storico Ordini</h1>

                {orders.length === 0 ? (
                    <Alert variant="info">Non hai ancora effettuato nessun ordine.</Alert>
                ) : (
                    <>
                        <Table striped bordered hover responsive className="shadow-sm">
                            <thead>
                                <tr>
                                    <th>Numero Ordine</th>
                                    <th>Data</th>
                                    <th>Stato Ordine</th>
                                    <th>Stato Pagamento</th>
                                    <th>Totale</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order.orderNumber}</td>
                                        <td>{formatDateForTable(order.createdAt)}</td>
                                        <td>{order.orderStatus}</td>
                                        <td>{order.paymentStatus}</td>
                                        <td>{order.totalAmount?.toFixed(2)} {order.currency}</td>
                                        <td className="text-center">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                onClick={() => handleViewDetails(order._id)}
                                                aria-label={`Vedi dettagli ordine ${order.orderNumber}`}
                                            >
                                                <EyeFill />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <Pagination className="justify-content-center mt-4">
                            {[...Array(totalPages)].map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPage}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </>
                )}
            </Container>

            <OrderDetailModal
                show={showDetailModal}
                onHide={handleCloseDetailModal}
                order={selectedOrder}
            />
        </div>
    );
}

export default OrdersPage;