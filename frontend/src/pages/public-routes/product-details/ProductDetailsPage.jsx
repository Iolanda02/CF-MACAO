import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { Alert, Button, Col, Container, Form, Image, InputGroup, Row, Spinner } from "react-bootstrap";
import ProductReviewsArea from "../../../components/product-reviews-area/ProductReviewArea";
import { getProduct } from "../../../api/product";
import { CartPlusFill, Dash, Plus, StarFill } from "react-bootstrap-icons";
import { useCart } from "../../../contexts/CartContext";
import LoginModal from "../../../components/modals/LoginModal";
import RegisterModal from "../../../components/modals/RegistrerModal";
import { useToast } from "../../../contexts/ToastContext";

function ProductDetailsPage() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const params = useParams();
    const { isAuthenticated, authUser, login } = useAuth();
    const { addItemToCart } = useCart(); 
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { addToast } = useToast();
    
    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await getProduct(id);
            const fetchedProduct = result.data;
            setProduct(fetchedProduct);

            if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                setSelectedVariant(fetchedProduct.variants[0]);

                const mainVarImage = fetchedProduct.variants[0].images.find(img => img.isMain);
                setMainImage(mainVarImage || fetchedProduct.variants[0].images[0] || null);
            }
            
            setQuantity(1);
        } catch(error) {
            console.error(error);
            setError("Errore durante il caricamento del prodotto.")
            // navigate('/404', { replace: true });
        } finally {
            setLoading(false);
        }
    }, []);

    const productId = params.id;

    useEffect(() => {
        if (productId) {
            getProductDetails(productId);
        }
    }, [productId, getProductDetails]);

    const currentPrice = selectedVariant?.price?.amount;
    const currentStock = selectedVariant?.stock?.quantity;
    const variantImages = selectedVariant?.images || [];

    useEffect(() => {
        if (selectedVariant) {
            const mainVarImage = selectedVariant.images.find(img => img.isMain);
            setMainImage(mainVarImage || selectedVariant.images[0] || null);
        }
    }, [selectedVariant]);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, Math.min(prev + delta, currentStock || 1)));
    };

    const handleVariantChange = (variantId) => {
        const newSelectedVariant = product?.variants.find(v => v._id === variantId);
        if (newSelectedVariant) {
            setSelectedVariant(newSelectedVariant);
            setQuantity(1);
        }
    };

    const handleAddToCart = async () => {
        try {
            if(!isAuthenticated) {
                handleShowLogin();
                return;
            }
            // Recupero l'ID del prodotto, la quantità e l'ID della variante selezionata
            if (product && quantity > 0 && selectedVariant) {
                await addItemToCart(product?._id, quantity, selectedVariant._id);
                addToast(`"${product.name}" (${selectedVariant.name}) aggiunto al carrello!`, "info");
            }
        } catch (error) {
            console.error("Errore nell'aggiunta al carrello:", error);
            addToast("Errore nell'aggiunta al carrello. Riprova.", "danger");
        }
    };
    
    const handleShowLogin = () => {
        setShowRegisterModal(false); // Chiudi la modale di registrazione se aperta
        setShowLoginModal(true);
    };
    const handleCloseLogin = () => setShowLoginModal(false);

    const handleShowRegister = () => {
        setShowLoginModal(false); // Chiudi la modale di login se aperta
        setShowRegisterModal(true);
    };
    const handleCloseRegister = () => setShowRegisterModal(false);

    const handleLogin = async (email, password) => {
        try {
            await login({email, password}); 
        } catch (loginError) {
            console.error("Errore durante il login dalla modale:", loginError);
            addToast("Credenziali di accesso non valide.", "danger");
            setError("Credenziali di accesso non valide.")
        }
    }

    const handleRegister = async (firstName, lastName, email, password) => {
        try {
            await registerApi({
                firstName, 
                lastName, 
                email, 
                password
            });
            setShowRegisterModal(false);
            addToast("Registrazione avvenuta con successo!")
        } catch (loginError) {
            console.error("Errore durante il login dalla modale:", loginError);
            addToast("Errore durante la registrazione", "danger");
        }
    };
    
    const { averageRating, totalReviews } = useMemo(() => {
        if (!product?.reviews || product.reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const sumRatings = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        return {
            averageRating: (sumRatings / product.reviews.length),
            totalReviews: product.reviews.length
        };
    }, [product?.reviews]);

    // Per i prodotti correlati
    // const relatedProducts = productsData //--- recuperare i dati
    //     .filter(p => p._id !== product?._id)
    //     .sort(() => 0.5 - Math.random())
    //     .slice(0, 3);


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento prodotto...</span>
                </Spinner>
                <p>Caricamento prodotto...</p>
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
    
    if (!product) {
        return <Container className="my-5">
            <Alert variant="info" className="text-center">Prodotto non disponibile.</Alert>
        </Container>;
    }

    return (
        <Container className="my-5">
            <Row className="mb-5">
                <Col md={6} className="mt-3">
                
                    {mainImage && (
                        <Image 
                            src={mainImage.url} 
                            alt={mainImage.altText || product.name} 
                            fluid 
                            rounded 
                            className="shadow-sm mb-3" 
                            style={{ width: '100%', objectFit: 'contain' }} 
                        />
                    )}
                    {/* Slider di immagini secondarie */}
                    {variantImages.length > 1 && (
                        <div className="d-flex gap-2 overflow-auto py-2" style={{ maxWidth: '100%' }}>
                            {variantImages.map((img, index) => (
                                <Image 
                                    key={index} 
                                    src={img.url} 
                                    alt={img.altText || product.name} 
                                    thumbnail 
                                    style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        border: img.url === mainImage?.url ? '2px solid var(--bs-dark)' : '1px solid #dee2e6'
                                    }} 
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    )}
                </Col>
                <Col md={6}>
                    <h1 className="display-4 mb-3">{product.name}</h1>
                    <div className="d-flex align-items-center mb-3">
                        {totalReviews > 0 ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <StarFill 
                                        key={i} 
                                        className={i < Math.round(averageRating) ? "text-warning me-1" : "text-secondary me-1"} 
                                    />
                                ))}
                                <span className="ms-2 text-muted">
                                    ({averageRating.toFixed(1)} / 5 - {totalReviews} Recensioni)
                                </span>
                            </>
                        ) : (
                            <span className="text-muted">Nessuna recensione disponibile.</span>
                        )}
                    </div>

                    <h2 className="mb-4 text-dark">€{currentPrice ? currentPrice.toFixed(2) : 'N/D'}</h2>

                    <p className="lead mb-4">{product.description}</p>

                    {/* Selezione formato */}
                    <Form.Group className="mb-3">
                        <Form.Label>Seleziona Formato:</Form.Label>
                        <Form.Select
                            value={selectedVariant?._id || ''}
                            onChange={(e) => handleVariantChange(e.target.value)}
                            className="w-auto"
                        >
                            {product.variants.map(variant => (
                                <option key={variant._id} value={variant._id}>
                                    {variant.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Controlli quantità e Aggiungi al Carrello */}
                    <div className="d-flex align-items-center mt-auto flex-wrap gap-4 mb-4">
                        <InputGroup className="w-auto quantity-control">
                            <Button variant="outline-secondary" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={loading || !selectedVariant || quantity <= 1}
                                className="border-end-0"
                            ><Dash /></Button>
                            <Form.Control type="text" readOnly value={quantity}  className="text-center quantity-input" 
                            disabled={currentStock <= 0} />
                            <Button variant="outline-secondary" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={loading || !selectedVariant || quantity >= currentStock}
                            ><Plus /></Button>
                        </InputGroup>
                        <Button variant="outline-secondary" size="lg" 
                        className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={loading || !selectedVariant || currentStock <= 0 || quantity > currentStock}
                        >
                            <CartPlusFill className="me-2" /> Aggiungi al Carrello
                        </Button>
                    </div>

                    {/* Info aggiuntive */}
                    <p className="text-muted">Disponibilità: {currentStock  > 0 ? `${currentStock } in magazzino` : 'Esaurito'}</p>
                    {/* <p className="text-muted">SKU: COF{product.id}CAP</p> */}
                </Col>
            </Row>

            {/* Descrizione estesa */}
            {/* {product.description && 
                <Row className="mb-5">
                    <Col>
                        <h3 className="mb-3">Dettagli del Prodotto</h3>
                        <p>{product.description}</p>
                    </Col>
                </Row>
            } */}

            {/* Sezione Recensioni */}
            <Row className="mb-5">
                <Col>
                    <ProductReviewsArea productId={product._id} productReviews={product.reviews || []} />
                </Col>
            </Row>

            {/* Prodotti Correlati */}
            {/* <Row className="mb-5">
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
            </Row> */}
            
            <LoginModal
                show={showLoginModal}
                handleClose={handleCloseLogin}
                onLogin={handleLogin}
                onSwitchToRegister={handleShowRegister}
            />
            
            <RegisterModal
                show={showRegisterModal}
                handleClose={handleCloseRegister}
                onRegister={handleRegister}
                onSwitchToLogin={handleShowLogin}
            />
        </Container>
    )
}

export default ProductDetailsPage;