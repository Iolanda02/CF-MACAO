import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Pagination, Row, Spinner, Table, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { cancelOrder, getAllOrdersAdmin } from "../../../api/order";
import { EyeFill, PencilFill, Search, TrashFill, XCircle } from "react-bootstrap-icons";
import DeleteModal from "../../../components/modals/DeleteModal";
import "./styles.css";

function AdminOrdersListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilterInput, setCurrentFilterInput] = useState("");
    // const [filterStatus, setFilterStatus] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const navigate = useNavigate();

    const [paginator, setPaginator] = useState({
        page: 1,
        perPage: 6,
        totalCount: 0,
        totalPages: 1
    });

    const [paginationItems, setPaginationItems] = useState([]);
    
    // Fetch dei prodotti quando cambia la pagina o il filtro
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllOrdersAdmin(searchTerm, paginator);
            setOrders(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Error fetching orders:", error);
            setMessage({ type: 'danger', text: 'Impossibile caricare gli ordini. Riprova più tardi.' });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, paginator.page, paginator.perPage]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    // Funzione per cambiare la pagina 
    const handlePageChange = useCallback((number) => {
        if (number !== paginator.page && number <= paginator.totalPages && number >= 1) {
            setPaginator(prev => ({
                ...prev,
                page: number,
            }));
        }
    }, [paginator.page, paginator.totalPages]);

    // Funzione per applicare il filtro
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
    
    const handleDelete = (order) => {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await cancelOrder(orderToDelete._id);
            setMessage({ type: 'success', text: 'Ordine eliminato con successo!' });
            fetchOrders(); // Ricarica la lista dopo la cancellazione
            if (currentPage > Math.ceil((orders.length - 1) / productsPerPage)) {
                setCurrentPage(Math.max(1, currentPage - 1));
            }
            setShowDeleteModal(false);
            setOrderToDelete(null);
        } catch (err) {
            console.error("Errore nella cancellazione ordine:", err);
            setMessage({ type: 'danger', text: 'Errore durante l\'eliminazione del\'ordine.' });
        }
    };
    
    // const handleStatusFilterChange = (event) => {
    //     setFilterStatus(event.target.value);
    // };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento prodotti...</span>
                </Spinner>
                <p>Caricamento prodotti...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Gestione Ordini</h1>

            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                {message.text}
                </Alert>
            )}
            
            {/* Componente di Ricerca */}
            {(orders?.length > 0 || currentFilterInput) && 
                <Row className="mb-4">
                    <Col>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Filtra ordini..."
                                value={currentFilterInput}
                                onChange={(e) => setCurrentFilterInput(e.target.value)}
                                disabled={loading}
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
                    {/* <Form.Group>
                        <Form.Label>Filtra per Stato:</Form.Label>
                        <Form.Select value={filterStatus} onChange={handleStatusFilterChange}>
                        <option value="">Tutti</option>
                        <option value="Pending">In Sospeso</option>
                        <option value="Processing">In Elaborazione</option>
                        <option value="Shipped">Spedito</option>
                        <option value="Delivered">Consegnato</option>
                        <option value="Cancelled">Annullato</option>
                        <option value="Returned">Restituito</option>
                        </Form.Select>
                    </Form.Group> */}
                </Row>
            }

            {orders?.length === 0 ? (
                <h3 className="text-muted">Nessun ordine trovato</h3>
            ) : (
                <Table striped bordered hover responsive className="admin-orders-table">
                    <thead>
                        <tr>
                            <th className="text-dark-emphasis"># Ordine</th>
                            <th className="text-dark-emphasis">Cliente</th>
                            <th className="text-dark-emphasis">Totale</th>
                            <th className="text-dark-emphasis">Stato Pagamento</th>
                            <th className="text-dark-emphasis">Stato Ordine</th>
                            <th className="text-dark-emphasis">Data Ordine</th>
                            <th className="text-dark-emphasis text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={index}>
                                <td><b>{order.orderNumber}</b></td>
                                <td>{order.user?.email || 'N/A'}</td>
                                <td>{order.totalAmount?.toFixed(2)} {order.currency}</td>
                                <td>{order.paymentStatus}</td>
                                <td>{order.orderStatus}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Link to={`/admin/orders/${order._id}`}>
                                            <Button variant="outline-dark" size="sm" title="Visualizza ordine">
                                            <EyeFill />
                                            </Button>
                                        </Link>
                                        <Link to={`/admin/orders/edit/${order._id}`}>
                                            <Button variant="outline-secondary" size="sm" title="Modifica ordine">
                                            <PencilFill />
                                            </Button>
                                        </Link>
                                        <Button variant="outline-danger" size="sm" 
                                            onClick={() => handleDelete(order)} title="Elimina ordine">
                                            <TrashFill />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

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
        
        <DeleteModal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteUser}
            textToShow={"Sei sicuro di voler eliminare l'ordine " +
                (orderToDelete ? (orderToDelete.orderNumber) : '') + "?"
            }
        />
        </Container>
    )
}

export default AdminOrdersListPage;