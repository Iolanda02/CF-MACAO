import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { getAllProducts, removeProduct } from "../../../api/product";
import { CheckCircleFill, EyeFill, PencilFill, PlusCircleFill, Search, TrashFill, XCircleFill } from "react-bootstrap-icons";

function AdminProductsListPage() {
    const [products, setProducts] = useState([]);
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

    // Fetch dei prodotti quando cambia la pagina o il filtro
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const result = await getAllProducts(filterTerm, paginator);
            setProducts(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Error fetching products:", error);
            setError("Impossibile caricare i prodotti. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    }, [filterTerm, paginator.page, paginator.perPage]);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
    
    const clearFilter = () => {
        setPaginator({
            page: 1,
            perPage: 6,
            totalCount: 0,
            totalPages: 1
        });
        setCurrentFilterInput("");
    };

    const handleDelete = async (product) => {
        if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
            try {
                const result = await removeProduct(product._id);
                setMessage({ type: 'success', text: 'Prodotto eliminato con successo!' });
                // Resetta la paginazione se l'eliminazione causa la scomparsa dell'ultima pagina
                // if (currentPage > Math.ceil((products.length - 1) / productsPerPage)) {
                //     setCurrentPage(Math.max(1, currentPage - 1));
                // }
                fetchProducts();
            } catch(error) {
                console.log(error);
                setMessage({ type: 'danger', text: 'Errore durante l\'eliminazione del prodotto.' });
            }
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
        <Container className="my-4">
        <Row className="mb-4 align-items-center">
            <Col>
            <h2>Gestione Prodotti</h2>
            </Col>
            <Col xs="auto">
            <Button as={Link} to="/admin/products/new" variant="primary">
                <PlusCircleFill className="me-2" />Aggiungi Prodotto
            </Button>
            </Col>
        </Row>

        {message && (
            <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
            {message.text}
            </Alert>
        )}

        {/* Componente di Ricerca */}
            <Row className="mb-4">
                <Col>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Cerca per nome, brand, tag..."
                            value={currentFilterInput}
                            onChange={() => setCurrentFilterInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') applyFilter();
                            }}
                            disabled={loading}
                        />
                        <Button variant="outline-secondary" onClick={applyFilter} disabled={loading}>
                            <Search className="me-1" />Cerca
                        </Button>
                        <Button variant="outline-danger" onClick={clearFilter} disabled={loading || !currentFilterInput}>
                            <XCircleFill className="me-1" />Reset
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="admin-products-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    {/* <th>Prezzo</th>
                    <th>Quantità</th> */}
                    <th>Varianti</th>
                    <th>Attivo</th>
                    <th className="text-center">Azioni</th>
                </tr>
                </thead>
                <tbody>
                {products.length > 0 ? (
                    products.map((product, index) => (
                    <tr key={product._id}>
                        <td>{(paginator.page - 1) * paginator.perPage + index + 1}</td>
                        <td>{product.name}</td>
                        {/* <td>€ {product.price.toFixed(2)}</td>
                        <td>{product.stock}</td> */}
                        <td className="align-middle">{product.variants?.length || 0}</td>
                        <td className="align-middle text-center">
                            {product.isActive ? (
                                <span className="text-success"><CheckCircleFill /></span>
                            ) : (
                                <span className="text-danger"><XCircleFill /></span>
                            )}
                        </td>
                        <td className="text-center">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/admin/products/${product._id}`)}>
                            <EyeFill /> Visualizza
                        </Button>
                        <Button variant="outline-info" size="sm" className="me-2" onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                            <PencilFill /> Modifica
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product)}>
                            <TrashFill /> Elimina
                        </Button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="5" className="text-center">Nessun prodotto disponibile.</td>
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

export default AdminProductsListPage;