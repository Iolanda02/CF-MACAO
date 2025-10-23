import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { DashCircleFill, PlusCircleFill, TrashFill } from "react-bootstrap-icons";
import { useCart } from "../../../contexts/CartContext";
import { useNavigate } from 'react-router';
import "./styles.css";

function CartPage() {
    const { cart, isLoading, error, updateCartItemQuantity, removeCartItem } = useCart();
    const navigate = useNavigate();
    // const [promoCode, setPromoCode] = useState('');
    // const [showPromoInput, setShowPromoInput] = useState(false);

    
    const handleQuantityChange = async (itemId, variantId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItemQuantity(itemId, variantId, newQuantity);
        } catch (error) {
            console.error("Errore nell'aggiornamento quantità:", error);
        }
    };

    const handleRemoveItem = async (itemId, variantId) => {
        try {
            await removeCartItem(itemId, variantId);
        } catch (error) {
            console.error("Errore nella rimozione dell'articolo:", error);
        }
    }

    const handleCheckout = () => {
        navigate("/checkout", { state: { cartData: cart } });
    };
    
    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento carrello...</span>
                </Spinner>
                <p>Caricamento carrello...</p>
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
        <Container className="cart-page my-5">
            <Row>
                <Col>
                    <h1 className="cart-title mb-4">Carrello</h1>
                    {cart?.items?.length === 0 && 
                        <p className="cart-summary">{cart.items.length} Articoli | € {cart?.subtotal.toFixed(2).replace('.', ',')}</p>
                    }
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={8}>
                    <div className="cart-items-list">
                        {cart?.items?.length === 0 ? (
                            <p>Il carrello è vuoto.</p>
                        ) : (
                            cart?.items?.map(item => (
                                <Card className="cart-item mb-3" key={`${item._id}-${item.variant?._id}`}>
                                    <Row className="g-0 align-items-center">
                                        <Col xs={3} md={2}>
                                            <Card.Img src={item.variant?.images?.[0]?.url} alt={item.variant?.images?.[0]?.url} className="cart-item-img p-2" />
                                        </Col>
                                        <Col xs={9} md={10}>
                                            <Card.Body>
                                                <Row className="align-items-center">
                                                    <Col md={6}>
                                                        <p className="item-brand mb-1">{item.item?.brand}</p>
                                                        <Card.Title className="item-name">{item.productName}</Card.Title>
                                                        <Card.Text className="item-format text-muted">{item.variantName}</Card.Text>
                                                        <Button variant="link" className="item-remove-btn p-0" onClick={() => handleRemoveItem(item.item?._id, item.variant?._id)}>
                                                            <TrashFill className="me-1" /> Rimuovi
                                                        </Button>
                                                    </Col>
                                                    <Col md={3} className="text-center text-md-start my-2 my-md-0">
                                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                                                            <Button variant="light" size="sm" onClick={() => handleQuantityChange(item.item._id, item.variant._id, item.quantity - 1)} aria-label="Diminuisci quantità">
                                                                <DashCircleFill />
                                                            </Button>
                                                            <span className="mx-2 item-quantity-display">{item.quantity}</span>
                                                            <Button variant="light" size="sm" onClick={() => handleQuantityChange(item.item?._id, item.variant?._id, item.quantity + 1)} aria-label="Aumenta quantità">
                                                                <PlusCircleFill />
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                    <Col md={3} className="text-end">
                                                        <p className="item-price mb-0">€ {(item.quantity * (item.price?.amount)).toFixed(2).replace('.', ',')}</p>
                                                        {/* <Card.Text className="item-price-per-unit text-muted small">€ {item.pricePerUnit.toFixed(2).replace('.', ',')} / capsula</Card.Text> */}
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            ))
                        )}
                    </div>
                </Col>
                <Col md={4}>
                    <Card className="order-summary p-3">
                        <Card.Title className="summary-title mb-3">Il tuo ordine</Card.Title>

                        {/* <div className="promo-code-section mb-3">
                            <Button variant="link" className="promo-toggle-btn w-100 text-start text-decoration-none text-dark d-flex justify-content-between align-items-center" onClick={() => setShowPromoInput(!showPromoInput)}>
                                Disponi di un codice promo? <TagFill />
                            </Button>
                            {showPromoInput && (
                                <InputGroup className="mt-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Inserisci codice"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        aria-label="Codice promozionale"
                                    />
                                    <Button variant="outline-secondary" onClick={handlePromoCodeApply}>
                                        Applica
                                    </Button>
                                </InputGroup>
                            )}
                        </div> */}

                        <div className="summary-details mt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Totale provvisorio</span>
                                {cart?.subtotal ? (
                                    <span>€ {cart?.subtotal?.toFixed(2).replace('.', ',')}</span>
                                ) : (
                                    <span>0</span>
                                )
                                }
                            </div>
                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                <span>Spese di spedizione <i className="bi bi-info-circle-fill text-muted" title="3 giorni lavorativi"></i></span>
                                <span className="text-success">
                                    {cart?.shippingCost?.amount ? (
                                       <span>€ {cart.shippingCost.amount.toFixed(2).replace('.', ',')}</span> 
                                    ) : (
                                        <span>Gratuita</span>
                                    )}
                                </span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                                <span>Totale</span>
                                {cart?.totalAmount ? (
                                    <span>€ {cart.totalAmount.toFixed(2).replace('.', ',')}</span>
                                ) : (
                                    <span>0</span>
                                )}
                            </div>
                            <p className="text-muted small text-end">IVA inclusa</p>
                        </div>

                        <Button variant="dark" size="lg" className="checkout-btn w-100"
                        onClick={handleCheckout}>
                            CHECKOUT
                        </Button>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default CartPage;