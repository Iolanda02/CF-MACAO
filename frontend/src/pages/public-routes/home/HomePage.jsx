import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import "./styles.css";
import { getAllProducts } from "../../../api/product";
import ProductCard from "../../../components/product-card/ProductCard";
import { Search, XCircle, XCircleFill } from "react-bootstrap-icons";


function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
            const result = await getAllProducts(searchTerm, paginator);
            setProducts(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Errore nel recupero dei prodotti:", error);
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
    
    if (loading) {
        return (
        <div className="home-page-wrapper">
            <div className="home-page-content">
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento catalogo...</span>
                    </Spinner>
                    <p>Caricamento catalogo...</p>
                </Container>
            </div>
        </div>
        );
    }

    return (
        <div className="home-page-wrapper">
            <div className="home-page-content">
                <Container fluid="md" className="my-4 mb-5">
                    <h1 className="text-center mb-5 main-title">Catalogo Prodotti</h1>
                    
                    {message && (
                        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                        {message.text}
                        </Alert>
                    )}

                    {(products?.length > 0 || currentFilterInput) && 
                        <Row className="my-4 justify-content-center">
                            <Col md={8} lg={6}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Cerca prodotti per nome"
                                        value={currentFilterInput}
                                        onChange={(e) => setCurrentFilterInput(e.target.value)}
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

                    {products.length === 0 ? (
                        <h3 className="text-center text-muted">Nessun prodotto trovato</h3>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {products.map((product, index) => (
                                <Col key={index}>
                                    {product.isActive && (
                                        <ProductCard product={product} />
                                    )}
                                </Col>
                            ))}
                        </Row>
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
                </Container>
            </div>
        </div>
    );
}

export default HomePage;