import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { getAllProducts, removeProduct } from "../../../api/product";
import { CheckCircleFill, EyeFill, PencilFill, PlusCircle, Search, TrashFill, XCircle, XCircleFill } from "react-bootstrap-icons";
import DeleteModal from "../../../components/modals/DeleteModal";
import "./styles.css";

function AdminProductsListPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilterInput, setCurrentFilterInput] = useState("");
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

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
            const result = await getAllProducts(searchTerm, paginator);
            setProducts(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Error fetching products:", error);
            setMessage({ type: 'danger', text: 'Impossibile caricare i prodotti. Riprova più tardi.' });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, paginator.page, paginator.perPage]);


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

    const handleDeleteProduct = async () => {
        try {
            const result = await removeProduct(productToDelete._id);
            setMessage({ type: 'success', text: 'Prodotto eliminato con successo!' });
            // Resetta la paginazione se l'eliminazione causa la scomparsa dell'ultima pagina
            fetchProducts();
            if (currentPage > Math.ceil((products.length - 1) / productsPerPage)) {
                setCurrentPage(Math.max(1, currentPage - 1));
            }
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch(error) {
            console.log(error);
            setMessage({ type: 'danger', text: 'Errore durante l\'eliminazione del prodotto.' });
        }
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
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

    return (
        <Container className="my-4">
            <Row className="mb-4 align-items-center">
                <Col>
                <h1 className="m-0">Gestione Prodotti</h1>
                </Col>
                <Col xs="auto">
                <Button as={Link} to="/admin/products/new" variant="outline-dark">
                    <PlusCircle className="me-2" />Aggiungi Prodotto
                </Button>
                </Col>
            </Row>

            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                {message.text}
                </Alert>
            )}

            {/* Componente di Ricerca */}
            {(products?.length > 0 || currentFilterInput) && 
                <Row className="mb-4">
                    <Col>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Filtra prodotti..."
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
                </Row>
            }

            {products?.length === 0 ? (
                <h3 className="text-muted">Nessun prodotto trovato</h3>
            ) : (
                <Table striped bordered hover responsive className="admin-products-table">
                    <thead>
                    <tr>
                        <th className="text-dark-emphasis">#</th>
                        <th className="text-dark-emphasis">Nome</th>
                        <th className="text-dark-emphasis">Varianti</th>
                        <th className="text-dark-emphasis">Attivo</th>
                        <th className="text-dark-emphasis text-center">Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product._id}>
                                <td>{(paginator.page - 1) * paginator.perPage + index + 1}</td>
                                <td><b>{product.name}</b></td>
                                <td className="align-middle">{product.variants?.length || 0}</td>
                                <td className="align-middle text-center">
                                    {product.isActive ? (
                                        <span className="text-success"><CheckCircleFill /></span>
                                    ) : (
                                        <span className="text-danger"><XCircleFill /></span>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Button variant="outline-dark" size="sm" className="me-2" title="Visualizza prodotto"
                                            onClick={() => navigate(`/admin/products/${product._id}`)}
                                        >
                                            <EyeFill />
                                        </Button>
                                        <Button variant="outline-secondary" size="sm" className="me-2" title="Modifica prodotto"
                                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                        >
                                            <PencilFill />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" title="Elimina prodotto"
                                            onClick={() => handleDelete(product)}
                                        >
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
                onConfirm={handleDeleteProduct}
                textToShow={"Sei sicuro di voler eliminare il prodotto " +
                    (productToDelete ? (productToDelete.name) : '') + "?"
                }
            />
        </Container>
    )
}

export default AdminProductsListPage;