import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../components/product-card/ProductCard";
import { Container, Image } from "react-bootstrap";
import ProductReviewsArea from "../../../components/product-reviews-area/ProductReviewArea";

function ProductDetailsPage() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState(null);
    const params = useParams();
    const { authUser } = useAuth(); 
    const { addToCart } = useCart(); 
    const navigate = useNavigate();

    const productId = params.id;

    useEffect(() => {
        if (productId) {
            getProductDetails(productId);
        }
    }, [productId, getProductDetails]);

        
    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(false);
            const result = await fetchProductDetails(id);
            setProduct(result);
            setSelectedFormat(result.formats[0].quantity);
            setQuantity(1);
        } catch(error) {
            setError(true);
            console.error(error);
            // navigate('/404', { replace: true });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleFormatChange = (formatQuantity) => {
        setSelectedFormat(parseInt(formatQuantity));
    };

    const handleAddToCart = () => {
        if (product && quantity > 0 && selectedFormat) {
            addToCart(product, quantity, selectedFormat);
        }
    };

    const currentPrice = product?.formats.find(f => f.quantity === selectedFormat)?.pricePerPack || product?.price;

    // Per i prodotti correlati
    const relatedProducts = productsData //--- recuperare i dati
        .filter(p => p.id !== product?.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    if (error) {
        return <Container className="my-5"><Alert variant="danger" className="text-center">Errore durante il caricamento del prodotto. Potrebbe non esistere.</Alert></Container>;
    }
    if (loading) {
        return <Container className="my-5"><h2 className="text-center text-primary">Caricamento prodotto...</h2></Container>;
    }
    if (!product) {
        return <Container className="my-5"><Alert variant="info" className="text-center">Prodotto non disponibile.</Alert></Container>;
    }

    return (
        <Container className="my-5">
            <Row className="mb-5 align-items-center">
                <Col md={6}>
                    <Image src={product.image?.path} fluid rounded className="shadow-sm" style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }} />
                    {/* <div className="mt-3 d-flex gap-2">
                        <Image src={product.thumbnail1} thumbnail style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                        <Image src={product.thumbnail2} thumbnail style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    </div> */}
                </Col>
                <Col md={6}>
                    <h1 className="display-4 mb-3">{product.name}</h1>
                    {/* Rating medio (mock) */}
                    <div className="d-flex align-items-center mb-3">
                        <StarFill className="text-warning me-1" />
                        <StarFill className="text-warning me-1" />
                        <StarFill className="text-warning me-1" />
                        <StarFill className="text-warning me-1" />
                        <StarFill className="text-secondary" />
                        <span className="ms-2 text-muted">(4.2 / 5 - 120 Recensioni)</span>
                    </div>

                    <h2 className="mb-4 text-primary">€{currentPrice ? currentPrice.toFixed(2) : 'N/D'}</h2>

                    <p className="lead mb-4">{product.description}</p>

                    {/* Selezione formato */}
                    <Form.Group className="mb-3">
                        <Form.Label>Seleziona Formato:</Form.Label>
                        <Form.Select
                            value={selectedFormat || ''}
                            onChange={(e) => handleFormatChange(e.target.value)}
                            className="w-auto"
                        >
                            {product.formats.map(format => (
                                <option key={format.quantity} value={format.quantity}>
                                    {format.quantity} capsule (€{format.pricePerPack.toFixed(2)})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Controlli quantità e Aggiungi al Carrello */}
                    <div className="d-flex align-items-center mb-4">
                        <InputGroup className="w-auto me-3">
                            <Button variant="outline-secondary" onClick={() => handleQuantityChange(-1)}><Dash /></Button>
                            <Form.Control type="text" readOnly value={quantity} className="text-center" style={{ maxWidth: '60px' }} />
                            <Button variant="outline-secondary" onClick={() => handleQuantityChange(1)}><Plus /></Button>
                        </InputGroup>
                        <Button variant="primary" size="lg" onClick={handleAddToCart}>
                            <CartPlusFill className="me-2" /> Aggiungi al Carrello
                        </Button>
                    </div>

                    {/* Info aggiuntive */}
                    <p className="text-muted">Disponibilità: {product.stock > 0 ? `${product.stock} in magazzino` : 'Esaurito'}</p>
                    {/* <p className="text-muted">SKU: COF{product.id}CAP</p> */}
                </Col>
            </Row>

            {/* Descrizione estesa */}
            <Row className="mb-5">
                <Col>
                    <h3 className="mb-3">Dettagli del Prodotto</h3>
                    <p>{product.description}</p>
                </Col>
            </Row>

            {/* Sezione Recensioni */}
            <Row className="mb-5">
                <Col>
                    <ProductReviewsArea productId={product.id} />
                </Col>
            </Row>

            {/* Prodotti Correlati */}
            <Row className="mb-5">
                <Col>
                    <h3 className="mb-4">Potrebbe interessarti anche...</h3>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {relatedProducts.map(relProduct => (
                            <Col key={relProduct.id}>
                                <Link to={`/product/${relProduct.id}`} className="text-decoration-none text-dark">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Img variant="top" src={relProduct.image} style={{ height: '150px', objectFit: 'cover' }} />
                                        <Card.Body>
                                            <Card.Title className="fs-5">{relProduct.name}</Card.Title>
                                            <Card.Text className="text-primary fw-bold">
                                                A partire da €{relProduct.formats[0].pricePerPack.toFixed(2)}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}

export default ProductDetailsPage;