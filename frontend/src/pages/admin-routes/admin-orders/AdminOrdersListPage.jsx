import { useState } from "react";
import { Button, Col, Container, Pagination, Row } from "react-bootstrap";
import { Form, Link, useNavigate } from "react-router";

function AdminOrdersListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [filterTerm, setFilterTerm] = useState("");
    const [currentFilterInput, setCurrentFilterInput] = useState("");
    const navigate = useNavigate();

    const [paginator, setPaginator] = useState({
        page: 1,
        perPage: 6,
        totalCount: 0,
        totalPages: 1
    });

    const [paginationItems, setPaginationItems] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Fetch dei prodotti quando cambia la pagina o il filtro
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const result = await getAllOrders(filterTerm, paginator);
            setOrders(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            setError(true);
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [filterTerm, paginator.page, paginator.perPage]);


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

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questo ordine?')) {
            try {
                const result = await remove(id);
                setOrders(orders.filter(order => order._id !== id));
                setMessage({ type: 'success', text: 'Ordine eliminato con successo!' });
                // Resetta la paginazione se l'eliminazione causa la scomparsa dell'ultima pagina
                // if (currentPage > Math.ceil((products.length - 1) / productsPerPage)) {
                //     setCurrentPage(Math.max(1, currentPage - 1));
                // }
            } catch(error) {
                console.log(error);
                setMessage({ type: 'danger', text: 'Errore durante l\'eliminazione dell\'ordine.' });
            }
        }
    };

    if (loading) return <Container className="my-4">
                            <Alert variant="info" className="text-center">
                                <h3>Caricamento prodotti...</h3>
                            </Alert>
                        </Container>;
    if (error) return <Container className="my-4">
                            <Alert variant="danger">Errore durante il caricamento dei prodotti: {error.message}</Alert>
                        </Container>;

    return (
        <Container className="mt-4">
        <h1 className="mb-4">Gestione Ordini</h1>

        <Row className="mb-3 align-items-center">
            <Col md={6}>
            <Form onSubmit={handleSearchSubmit}>
                <Form.Group as={Row}>
                <Col sm={9}>
                    <Form.Control
                    type="text"
                    placeholder="Cerca per N. ordine, Cliente..."
                    value={searchTerm}
                    onChange={handleSearchChange}
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
            {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
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
                    <Button variant="danger" size="sm" onClick={() => handleDeleteOrder(order._id)} title="Elimina Ordine">
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
        </Container>
    )
}

export default AdminOrdersListPage;