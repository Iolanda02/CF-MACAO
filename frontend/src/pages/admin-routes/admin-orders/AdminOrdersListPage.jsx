import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { cancelOrder, getAllOrdersAdmin } from "../../../api/order";
import { EyeFill, PencilFill, Search, TrashFill } from "react-bootstrap-icons";
import DeleteModal from "../../../components/modals/DeleteModal";

function AdminOrdersListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
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
            setError(false);
            const result = await getAllOrdersAdmin(searchTerm, paginator);
            setOrders(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Error fetching orders:", error);
            setError("Impossibile caricare gli ordini. Riprova più tardi.");
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

    // Funzione per cambiare la pagina (clic sul numero)
    const handlePageChange = useCallback((number) => {
        if (number !== paginator.page && number <= paginator.totalPages && number >= 1) {
            setPaginator(prev => ({
                ...prev,
                page: number,
            }));
        }
    }, [paginator.page, paginator.totalPages]);

    // Funzione per applicare il filtro (clic sul pulsante Cerca)
    const applyFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
    };
    
    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };
    
    const handleDelete = (order) => {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await cancelOrder(orderToDelete._id);
            fetchOrders(); // Ricarica la lista dopo la cancellazione
            setShowDeleteModal(false);
            setOrderToDelete(null);
        } catch (err) {
            console.error("Errore nella cancellazione utente:", err);
            setError("Impossibile cancellare l'utente.");
        }
    };

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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
        <h1 className="mb-4">Gestione Ordini</h1>

        <Row className="mb-3 align-items-center">
            <Col md={6}>
            <Form onSubmit={applyFilter}>
                <Form.Group as={Row}>
                <Col sm={9}>
                    <Form.Control
                    type="text"
                    placeholder="Cerca per N. ordine, Cliente..."
                    value={searchTerm}
                    onChange={() => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col sm={3}>
                    <Button variant="outline-secondary" type="submit">
                    <Search />
                    </Button>
                </Col>
                </Form.Group>
            </Form>
            </Col>
            <Col md={3}>
            <Form.Group>
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
            </Form.Group>
            </Col>
        </Row>

        <Table striped bordered hover responsive className="mt-3">
            <thead>
            <tr>
                <th># Ordine</th>
                <th>Cliente</th>
                <th>Totale</th>
                <th>Stato Pagamento</th>
                <th>Stato Ordine</th>
                <th>Data Ordine</th>
                <th>Azioni</th>
            </tr>
            </thead>
            <tbody>
            {orders.length > 0 ? (
                orders.map(order => (
                <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user?.email || 'N/A'}</td>
                    <td>{order.totalAmount?.toFixed(2)} {order.currency}</td>
                    <td>{order.paymentStatus}</td>
                    <td>{order.orderStatus}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                    <Link to={`/admin/orders/${order._id}`}>
                        <Button variant="info" size="sm" className="me-2" title="Visualizza Dettagli">
                        <EyeFill />
                        </Button>
                    </Link>
                    <Link to={`/admin/orders/edit/${order._id}`}>
                        <Button variant="warning" size="sm" className="me-2" title="Modifica Ordine">
                        <PencilFill />
                        </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(order)} title="Elimina Ordine">
                        <TrashFill />
                    </Button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="7" className="text-center">Nessun ordine trovato.</td>
                </tr>
            )}
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