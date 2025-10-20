import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import "./styles.css";
import { getAllProducts } from "../../../api/product";
import ProductCard from "../../../components/product-card/ProductCard";


function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterTerm, setFilterTerm] = useState("");
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
            setError(null);
            const result = await getAllProducts(filterTerm, paginator);
            setProducts(result.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: result.totalCount,
                totalPages: result.totalPages
            }));
        } catch(error) {
            console.error("Error fetching products:", error);
            setError("Impossibile caricare il catalogo dei prodotti. Riprova più tardi.");
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
    
    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento catalogo...</span>
                </Spinner>
                <p>Caricamento catalogo...</p>
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
        <Container fluid="md" className="my-4">
            <h1 className="text-center mb-5 main-title">Catalogo Prodotti</h1>
            <Row className="mb-4 justify-content-center">
                <Col md={8} lg={6}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Cerca prodotti per nome"
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    applyFilter();
                                }
                            }}
                        />
                        <Button variant="dark" onClick={applyFilter}>
                            Cerca
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            {products.length === 0 ? (
                <h3 className="text-center text-muted">Nessun prodotto trovato.</h3>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {products.map((product) => (
                        <Col key={product._id}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}

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
    );
}

export default HomePage;