import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Image, InputGroup, Modal, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllOrdersUser, getOrderById } from "../../../api/order";
import { EyeFill, Search, XCircle, XLg } from "react-bootstrap-icons";
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
                        <p><strong>Data Ordine:</strong> {formatDate(order.orderDate)}</p>
                        <p><strong>Stato Pagamento:</strong> {translatePaymentStatus(order.paymentStatus)}</p>
                        {/* <p><strong>Stato Ordine:</strong> {order.orderStatus}</p> */}
                    </Col>
                    <Col md={6}>
                        {/* <p><strong>Totale:</strong> {order.totalAmount?.toFixed(2)} {order.currency}</p> */}
                        <p><strong>Stato Ordine:</strong> {translateOrderStatus(order.orderStatus)}</p>
                        <p><strong>Metodo di Pagamento:</strong> {order.paymentMethod || 'Non specificato'}</p>
                    </Col>
                    <Col xs={12}>
                        <p><strong>Indirizzo di spedizione:</strong> 
                        {order.shippingAddress ? (
                            <span> {order.shippingAddress.address} 
                            {order.shippingAddress.postalCode? ', ' + order.shippingAddress.postalCode: ''} 
                            {order.shippingAddress.city? ', ' + order.shippingAddress.city: ''} 
                            {order.shippingAddress.country? ', ' + order.shippingAddress.country: ''}
                            </span>
                        ) : (
                            <span className="text-muted">Indirizzo di spedizione non disponibile</span>
                        )}
                        </p>
                        <p><strong>Telefono:</strong> {order.phone? order.phone : 'N/A'}</p>
                        {order.notes && <p><strong>Note:</strong> {order.notes}</p>}
                    </Col>
                </Row>

                <h5 className="mt-4 mb-3">Articoli Ordinati</h5>
                
                {order.items && order.items.length == 0 ? (
                    <h3 className="text-muted">Nessun articolo trovato per questo ordine</h3>
                ) : (
                    <Table striped bordered hover responsive size="user-single-order-table sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="text-dark-emphasis">Prodotto</th>
                                <th className="text-dark-emphasis">Variante</th>
                                <th className="text-dark-emphasis">Quantità</th>
                                <th className="text-dark-emphasis">Prezzo Unitario</th>
                                <th className="text-dark-emphasis">Subtotale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
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
                                    <td><b>{item.productName}</b></td>
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

const translatePaymentStatus = (statusPayment) => {
    return statusPayment === "Pending" ? 'In Sospeso' :
        statusPayment === "Paid" ? 'Pagato' :
        statusPayment === "Failed" ? 'Fallito' :
        statusPayment === "Refunded" ? 'Rimborsato' :
        statusPayment === "Partially Refunded" ? 'Parzialmente rimborsato' : '';
}

const translateOrderStatus = (orderStatus) => {
    return orderStatus === "Pending" ? 'In Sospeso' :
        orderStatus === "Processing" ? 'In Elaborazione' :
        orderStatus === "Shipped" ? 'Spedito' :
        orderStatus === "Delivered" ? 'Consegnato' :
        orderStatus === "Cancelled" ? 'Annullato' :
        orderStatus === "Returned" ? 'Restituito' : '';
}


function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilterInput, setCurrentFilterInput] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
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
            setMessage({ type: 'danger', text: 'Impossibile caricare gli ordini. Riprova più tardi.' });
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
        setSearchTerm(currentFilterInput);
    };

    const clearFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
        setSearchTerm("");
        setCurrentFilterInput("");
    };

    const handleViewDetails = async (orderId) => {
        setLoading(true);
        try {
            const fullOrderDetails = await getOrderById(orderId); 
            setSelectedOrder(fullOrderDetails.data);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Errore caricamento dettagli ordine:", err);
            setMessage({ type: 'danger', text: 'Impossibile caricare il dettaglio dell\'ordine. Riprova più tardi.' });
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

    return (
        <div className="py-4">
            <Container>
                <h1 className="mb-4">Storico Ordini</h1>
                
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                    {message.text}
                    </Alert>
                )}
                
                {/* Componente di Ricerca */}
                {(orders?.length > 0 || currentFilterInput || searchTerm) && 
                    <Row className="mb-4">
                        <Col>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Filtra ordini..."
                                    value={currentFilterInput}
                                    onChange={(e) => setCurrentFilterInput(e.target.value)}
                                    disabled={loading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilter();
                                        }
                                    }}
                                />
                                <Button variant="outline-dark" onClick={applyFilter} disabled={loading || !currentFilterInput}>
                                    <div className="d-flex align-items-center">
                                        <Search className="me-2" />
                                        Filtra
                                    </div>
                                </Button>
                                <Button variant="outline-dark" onClick={clearFilter} disabled={loading || !currentFilterInput}>
                                    <div className="d-flex align-items-center">
                                        <XCircle className="me-2" />
                                        Svuota
                                    </div>
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>
                }

                {orders.length === 0 ? (
                    <h3 className="text-muted">Non hai ancora effettuato ordini</h3>
                ) : (
                    <>
                        <Table striped bordered hover responsive className="user-orders-table shadow-sm">
                            <thead>
                                <tr>
                                    <th className="text-dark-emphasis">Numero Ordine</th>
                                    <th className="text-dark-emphasis">Data</th>
                                    <th className="text-dark-emphasis">Stato Ordine</th>
                                    <th className="text-dark-emphasis">Stato Pagamento</th>
                                    <th className="text-dark-emphasis">Totale</th>
                                    <th className="text-dark-emphasis text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.orderNumber}</td>
                                        <td>{formatDateForTable(order.orderDate)}</td>
                                        <td>{translateOrderStatus(order.orderStatus)}</td>
                                        <td>{translatePaymentStatus(order.paymentStatus)}</td>
                                        <td><b>{order.totalAmount?.toFixed(2)} {order.currency}</b></td>
                                        <td className="text-center">
                                            <Button 
                                                variant="outline-dark" 
                                                size="sm" 
                                                title="Visualizza ordine"
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
                            <Row className="my-3 justify-content-center">
                                <Col xs="auto" className="d-flex align-items-baseline gap-3 flex-wrap">
                                    <Pagination>
                                        <Pagination.First disabled={paginator.page === 1} onClick={() => handlePageChange(1)} />
                                        <Pagination.Prev disabled={paginator.page === 1} onClick={() => handlePageChange(paginator.page - 1)} />

                                        {paginationItems}

                                        <Pagination.Next disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.page + 1)} />
                                        <Pagination.Last disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.totalPages)} />
                                    </Pagination>
                                    <small className="text-muted">{paginator.totalCount} risultati totali</small>
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