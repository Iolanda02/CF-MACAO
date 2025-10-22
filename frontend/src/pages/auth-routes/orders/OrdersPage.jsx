import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Image, Modal, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllOrdersUser, getOrderById } from "../../../api/order";
import { ArrowLeft, EyeFill, XLg } from "react-bootstrap-icons";
import { useNavigate } from "react-router";

// Componente per visualizzare i dettagli di un singolo ordine nella modale
const OrderDetailModal = ({ show, onHide, order }) => {
    if (!order) return null;

    // Funzione helper per formattare la data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
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
                        {/* <p><strong>Stato Ordine:</strong> {order.orderStatus}</p> */}
                    </Col>
                    <Col md={6}>
                        {/* <p><strong>Totale:</strong> {order.totalAmount?.toFixed(2)} {order.currency}</p> */}
                        <p><strong>Stato Ordine:</strong> {order.orderStatus}</p>
                        <p><strong>Metodo di Pagamento:</strong> {order.paymentMethod || 'Non specificato'}</p>
                    </Col>
                    <Col>
                        <p><strong>Indirizzo di spedizione:</strong> 
                        {order.shippingAddress ? (
                            <span> {order.shippingAddress.address} 
                            {order.shippingAddress.postalCode? ', ' + order.shippingAddress.postalCode: ''} 
                            {order.shippingAddress.city? ', ' + order.shippingAddress.city: ''} 
                            {order.shippingAddress.country? ', ' + order.shippingAddress.country: ''}
                            </span>
                        ) : (
                            <Alert variant="warning">Indirizzo di spedizione non disponibile.</Alert>
                        )}
                        </p>
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

                {/* <h5 className="mt-4 mb-3">Indirizzo di Spedizione</h5>
                {order.shippingAddress ? (
                    <Card className="p-3">
                        <p className="mb-1">{order.shippingAddress.street}</p>
                        <p className="mb-1">{order.shippingAddress.zipCode} {order.shippingAddress.city}, {order.shippingAddress.province}</p>
                        <p className="mb-1">{order.shippingAddress.country}</p>
                    </Card>
                ) : (
                    <Alert variant="warning">Indirizzo di spedizione non disponibile.</Alert>
                )} */}
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
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [paginator, setPaginator] = useState({
        page: 1,
        perPage: 6,
        totalCount: 0,
        totalPages: 1
    });
    
    const [paginationItems, setPaginationItems] = useState([]);
    
    useEffect(() => {
        fetchOrders();
    }, [paginator.page, paginator.perPage, searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllOrdersUser(searchTerm, paginator);
            setOrders(response.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: response.totalCount,
                totalPages: response.totalPages
            }));
        } catch (err) {
            console.error("Errore nel recupero dello storico ordini:", err);
            setError("Impossibile caricare gli ordini. Riprova più tardi.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };
    
    // Funzione per cambiare la pagina (clic sul numero)
    const handlePageChange = useCallback((number) => {
        if (number !== paginator.page && number <= paginator.totalPages && number >= 1) {
            setPaginator(prev => ({
                ...prev,
                page: number,
            }));
        }
    }, [paginator.page, paginator.totalPages]);
    
    // Aggiorna gli elementi della paginazione quando i parametri del paginatore cambiano
    useEffect(() => {
        const pages = [];
        for (let number = 1; number <= paginator.totalPages; number++) {
            pages.push(
                <Pagination.Item key={number} active={number === paginator.page}
                    onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        setPaginationItems(pages);
    }, [paginator.totalPages, paginator.page]);
    
    // Funzione per applicare il filtro (clic sul pulsante Cerca)
    const applyFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
    };


    const handleViewDetails = async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            const fullOrderDetails = await getOrderById(orderId); 
            setSelectedOrder(fullOrderDetails.data);
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
                    <span className="visually-hidden">Caricamento ordini...</span>
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
                <div className="d-flex mb-3">
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        <ArrowLeft className="me-2" />Torna alla home
                    </Button>
                </div>
                <h1 className="mb-4">Storico Ordini</h1>

                {orders.length === 0 ? (
                    <Alert variant="info">Non hai ancora effettuato ordini.</Alert>
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

                        {/* Paginazione */}
                        {paginator.totalPages > 1 && (
                            <Row className="mt-5 justify-content-center">
                                <Col xs="auto">
                                    <Pagination>
                                        <Pagination.First disabled={paginator.page === 1} onClick={() => handlePageChange(1)} />
                                        <Pagination.Prev disabled={paginator.page === 1} onClick={() => handlePageChange(paginator.page - 1)} />

                                        {paginationItems}

                                        <Pagination.Next disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.page + 1)} />
                                        <Pagination.Last disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.totalPages)} />
                                    </Pagination>
                                </Col>
                            </Row>
                        )}
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