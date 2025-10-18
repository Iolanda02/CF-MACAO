import { useState } from "react";
import { Pagination } from "react-bootstrap";
import { useNavigate } from "react-router";
import "./styles.css";


function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filterTerm, setFilterTerm] = useState("");
    const navigate = useNavigate();

    const [paginator, setPaginator] = useState({
        page: 1,
        perPage: 6,
        totalCount: 0,
        totalPages: 1
    });

    const [paginationItems, setPaginationItems] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
            setError(true);
            console.error("Error fetching products:", error);
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

    return (
        <Container fluid="md" className="my-4">
            <h1 className="text-center mb-5 main-title">Catalogo di Caffè</h1>
            <Row className="mb-4 justify-content-center">
                <Col md={8} lg={6}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Cerca prodotti per nome o descrizione..."
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

            {error && <h2 className="text-center text-danger">Errore durante il caricamento dei prodotti!</h2>}
            {!error && loading && <h2 className="text-center text-primary">Caricamento prodotti...</h2>}
            {!error && !loading && (
                <>
                    {products.length === 0 ? (
                        <h3 className="text-center text-muted">Nessun prodotto trovato.</h3>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {products.map((product) => (
                                <Col key={product.id}>
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
                </>
            )}
        </Container>
    );
}

export default HomePage;