import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { BoxFill, CreditCardFill, GeoAltFill, TruckFrontFill } from "react-bootstrap-icons";
import { useAuth } from "../../../contexts/AuthContext";
import "./styles.css";
import { useCart } from "../../../contexts/CartContext";
import { updateCheckoutDetails } from "../../../api/cart";
import { useToast } from "../../../contexts/ToastContext";
import { createOrder } from "../../../api/order";


function CheckoutPage() {
    const { cart, isLoading, error: cartError, fetchCart } = useCart();
    const { authUser, isAuthenticated } = useAuth();

    const [cartItems, setCartItems] = useState(cart?.items || []);
    const [subtotal, setSubtotal] = useState(cart?.subtotal || 0);
    const [total, setTotal] = useState(cart?.totalAmount || 0);
    const [currentStep, setCurrentStep] = useState(1);

    const [loadingUpdateCheckout, setLoadingUpdateCheckout] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const [deliveryAddress, setDeliveryAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        address: '',
        postalCode: '',
        city: '',
        // province: '',
        country: '',
        mobilePhonePrefix: '+39',
        mobilePhoneNumber: '',
        fixedPhonePrefix: '',
        fixedPhoneNumber: '',
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false); 
    const [addressError, setAddressError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(cart?.paymentMethod || '' ); 
    const lastValidDeliveryAddress = useRef(deliveryAddress);
    const navigate = useNavigate();
    const { addToast } = useToast();
    

    const validateDeliveryAddress = (addressToCheck) => {
        // console.log("addressToCheck ", addressToCheck)
        const fields = [
            addressToCheck.firstName,
            addressToCheck.lastName,
            addressToCheck.email,
            // addressToCheck.confirmEmail,
            addressToCheck.address,
            addressToCheck.postalCode,
            addressToCheck.city,
            addressToCheck.country,
            addressToCheck.mobilePhoneNumber
        ];

        const allBaseFieldsFilled = fields.every(field => field && field.trim() !== '');

        // console.log("allBaseFieldsFilled ", allBaseFieldsFilled)

        return allBaseFieldsFilled;
    };

    useEffect(() => {
        if (cart) {
            setCartItems(cart.items || []);
            setSubtotal(cart.subtotal || 0);
            setTotal(cart.totalAmount || 0);
        } else {
            setCartItems([]);
            setSubtotal(0);
            setTotal(0);
        }
    }, [cart]);

    useEffect(() => {
        if (isAuthenticated && authUser) {
            const userAddress = {
                firstName: authUser.firstName || '',
                lastName: authUser.lastName || '',
                email: authUser.email || '',
                confirmEmail: authUser.email || '',
                address: cart.shippingAddress? cart.shippingAddress.address || '' : authUser.shippingAddress?.address || '',
                postalCode: cart?.shippingAddress? cart.shippingAddress.postalCode || '' : authUser.shippingAddress?.postalCode || '',
                city: cart?.shippingAddress? cart.shippingAddress.city || '' : authUser.shippingAddress?.city || '',
                country: cart?.shippingAddress? cart.shippingAddress.country || '' : authUser.shippingAddress?.country || '',
                mobilePhoneNumber: cart?.phone? cart.phone || '' : authUser.phone || '',
                fixedPhoneNumber: '',
            };
            setDeliveryAddress(userAddress);
            lastValidDeliveryAddress.current = userAddress;

            if (!isEditingAddress && !validateDeliveryAddress(userAddress)) {
                setIsEditingAddress(true);
                setAddressError("Completa il tuo indirizzo di spedizione per procedere."); 
            } else if (!isEditingAddress && validateDeliveryAddress(userAddress)) {
                setAddressError('');
            }
        }
    }, [isAuthenticated, authUser]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async () => {
        if (!validateDeliveryAddress(deliveryAddress)) {
            setAddressError("Per favore, compila tutti i campi obbligatori dell'indirizzo.");
            return;
        }
        setAddressError('');
        setCheckoutError('');

        const success = await updateCheckoutDetailsApiCall(deliveryAddress, paymentMethod);
        if (success) {
            // console.log("Indirizzo salvato e aggiornato via API:", deliveryAddress);
            setIsEditingAddress(false);
            setCurrentStep(prevStep => prevStep + 1)
        }
    };

    const handlePaymentMethodChange = async (e) => {
        setPaymentMethod(e.target.value);
        setCheckoutError('');
    };

    const handleSavePaymentMethod = async () => {
        if (!paymentMethod) {
            setCheckoutError("Seleziona un metodo di pagamento per procedere.");
            return;
        }
        setCheckoutError('');
        const success = await updateCheckoutDetailsApiCall(deliveryAddress, paymentMethod);
        if (success) {
            setCurrentStep(prevStep => prevStep + 1)
        }
    };

    const handleCancelAddressEdit = () => {
        setDeliveryAddress(lastValidDeliveryAddress.current);
        if (validateDeliveryAddress(lastValidDeliveryAddress.current)) {
            setIsEditingAddress(false);
            setAddressError('');
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            // Valida l'indirizzo
            if (!validateDeliveryAddress(deliveryAddress)) {
                setAddressError("Per favore, compila tutti i campi obbligatori dell'indirizzo.");
                return; 
            }
            setAddressError('');
        }
        // Valida il metodo di pagamento
        if (currentStep === 2) {
            if (!paymentMethod) {
                setCheckoutError("Seleziona un metodo di pagamento per procedere.");
                return;
            }
            setCheckoutError('');

            // if (paymentMethod === 'creditCard' && !validateCreditCardDetails() ) {
            //     setCheckoutError("I dettagli della carta di credito non sono validi.");
            //     return;
            // }
        }
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePrevStep = () => {
        setAddressError('');
        setCheckoutError('');
        setCurrentStep(prevStep => prevStep - 1);
    };

    const handleConfirmOrder = async () => {
        // Valida l'indirizzo prima di confermare
        // if (!validateDeliveryAddress(deliveryAddress)) {
        //     setCheckoutError("L'indirizzo di spedizione non è completo. Torna al Passo 1 per correggerlo.");
        //     setCurrentStep(1);
        //     return;
        // }

        // // Valida il metodo di pagamento prima di confermare
        // if (!paymentMethod) {
        //     setCheckoutError("Seleziona un metodo di pagamento. Torna al Passo 2 per sceglierlo.");
        //     setCurrentStep(2);
        //     return;
        // }

        // if (paymentMethod === 'creditCard' && !validateCreditCardDetails()) {
        //     setCheckoutError("I dettagli della carta di credito non sono validi. Torna al Passo 2.");
        //     setCurrentStep(2);
        //     return;
        // }

        setCheckoutError('');
        setSubmitting(true);

        try {
            const orderData = {
                paymentMethod: paymentMethod,
                shippingAddress: deliveryAddress
            };

            const response = await createOrder(orderData);
            // console.log("Ordine inviato con successo:", response);
            addToast("Ordine inviato con successo!", "success");
            fetchCart();
            navigate("/");
        } catch (error) {
            console.error("Errore durante la conferma dell'ordine:", error);
            const errorMessage = error.response?.data?.message || "Errore durante la conferma dell'ordine.";
            setCheckoutError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const updateCheckoutDetailsApiCall = async (address, payment) => {
        try {
            setLoadingUpdateCheckout(true);
            setCheckoutError(null);
            const result = await updateCheckoutDetails({
                shippingAddress: address, 
                paymentMethod: payment 
            });

            if (result.data?.shippingAddress) {
                setDeliveryAddress({
                    ...result.data.shippingAddress,
                    mobilePhoneNumber: result.data.phone || ''
                });
            }
            if (result.data?.paymentMethod) {
                setPaymentMethod(result.data.paymentMethod);
            }
            fetchCart();
            return true;
        } catch(error) {
            console.error("Error fetching cart:", error);
            setCheckoutError("Impossibile aggiornare i dati dell'ordine. Riprova più tardi.");
            return false;
        } finally {
            setLoadingUpdateCheckout(false);
        }
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento riepilogo...</span>
                </Spinner>
                <p>Caricamento riepilogo...</p>
            </Container>
        );
    }

    if (cartError) {
        return <Container className="checkout-page my-5">
            <Alert variant="danger">Errore nel caricamento del carrello: {cartError}</Alert>
        </Container>;
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <Container className="checkout-page my-5 text-center">
                <h2>Il tuo carrello è vuoto.</h2>
                <p>Aggiungi alcuni prodotti per procedere al checkout.</p>
                <Button variant="primary" as={Link} to="/">Torna allo shopping</Button>
            </Container>
        );
    }

    return (
        <Container className="checkout-page my-5">
            <Row>
                <Col>
                    <h1 className="checkout-title mb-4">Riepilogo</h1>
                    <p className="checkout-summary">{cartItems?.length} Articoli | € {(subtotal || 0).toFixed(2).replace('.', ',')}</p>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={8}>
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><TruckFrontFill className="me-2" /> 1. Opzioni di consegna</h2>
                        </Card.Header>
                            {currentStep === 1 && (
                            <Card.Body>
                                {loadingUpdateCheckout && <div className="loading-overlay">Aggiornamento dati...</div>}
                                {!isEditingAddress ? (
                                    <div className="delivery-address-display">
                                        <p className="fw-bold">{authUser.firstName} {authUser.lastName}</p>
                                        <p>{deliveryAddress.address}, {deliveryAddress.postalCode} {deliveryAddress.city}</p>
                                        <p>{deliveryAddress.country}</p>
                                        <p>Email: {authUser.email}</p>
                                        <p>Cellulare: {deliveryAddress.mobilePhoneNumber}</p>
                                        <Button variant="link" onClick={() => setIsEditingAddress(true)} className="p-0 edit-address-btn">
                                            <GeoAltFill className="me-1" /> Modifica indirizzo
                                        </Button>
                                        <div className="d-flex justify-content-end mt-4">
                                            <Button variant="dark" onClick={handleNextStep}>Continua</Button>
                                        </div>
                                    </div>
                                ) : (<Form noValidate>
                                        <h4 className="mb-3">Indirizzo di spedizione</h4>
                                        {addressError && <p className="text-danger small mb-3">{addressError}</p>}
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Nome*</Form.Label>
                                                <Form.Control type="text" name="firstName" 
                                                    value={authUser.firstName} 
                                                    onChange={handleAddressChange} 
                                                    required readOnly
                                                    isInvalid={!!addressError && authUser.firstName.trim() === ''} 
                                                />
                                                <Form.Control.Feedback type="invalid">Campo obbligatorio.</Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Cognome*</Form.Label>
                                                <Form.Control type="text" name="lastName" 
                                                value={authUser.lastName} 
                                                onChange={handleAddressChange} 
                                                required readOnly/>
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Email*</Form.Label>
                                                <Form.Control type="email" name="email" 
                                                value={authUser.email} 
                                                onChange={handleAddressChange} 
                                                required readOnly/>
                                            </Form.Group>
                                            {/* <Form.Group as={Col} md={6}>
                                                <Form.Label>Conferma Email*</Form.Label>
                                                <Form.Control type="email" name="confirmEmail" value={deliveryAddress.confirmEmail} onChange={handleAddressChange} required />
                                            </Form.Group> */}
                                        </Row>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Indirizzo*</Form.Label>
                                            <Form.Control type="text" name="address" value={deliveryAddress.address} onChange={handleAddressChange} required />
                                        </Form.Group>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>CAP*</Form.Label>
                                                <Form.Control type="text" name="postalCode" value={deliveryAddress.postalCode} onChange={handleAddressChange} required />
                                            </Form.Group>
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Città*</Form.Label>
                                                <Form.Control type="text" name="city" value={deliveryAddress.city} onChange={handleAddressChange} required />
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            {/* <Form.Group as={Col} md={6}>
                                                <Form.Label>Provincia*</Form.Label>
                                                <Form.Control type="text" name="province" value={deliveryAddress.province} onChange={handleAddressChange} required />
                                            </Form.Group> */}
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Nazione*</Form.Label>
                                                <Form.Control type="text" name="country" value={deliveryAddress.country} onChange={handleAddressChange} required />
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label>Cellulare**</Form.Label>
                                                <Form.Control type="text" name="mobilePhoneNumber" value={deliveryAddress.mobilePhoneNumber} onChange={handleAddressChange} required />
                                            </Form.Group>
                                            {/* <Form.Group as={Col} md={6}>
                                                <Form.Label>Telefono Fisso**</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>{deliveryAddress.fixedPhonePrefix || 'N/A'}</InputGroup.Text>
                                                    <Form.Control type="tel" name="fixedPhoneNumber" value={deliveryAddress.fixedPhoneNumber} onChange={handleAddressChange} />
                                                </InputGroup>
                                            </Form.Group> */}
                                        </Row>
                                        <p className="small text-muted mb-1">*Questo campo è obbligatorio.</p>

                                        {checkoutError && <p className="text-danger small mb-3">{checkoutError}</p>}
                                
                                        <div className="d-flex justify-content-between mt-4">
                                            <Button variant="secondary" onClick={handleCancelAddressEdit}>Annulla</Button>
                                            <Button variant="dark" onClick={handleSaveAddress}>Salva</Button>
                                        </div>
                                    </Form>
                                )}
                            </Card.Body>
                            )}
                    </Card>

                    {/* Pagamento */}
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><CreditCardFill className="me-2" />2. Pagamento</h2>
                        </Card.Header>
                            {currentStep === 2 && (
                                <Card.Body>
                                    {loadingUpdateCheckout && <div className="loading-overlay">Aggiornamento dati...</div>}
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="radio"
                                                id="paymentCreditCard"
                                                name="paymentMethod"
                                                label="Carta di Credito / Debito"
                                                value="Credit Card"
                                                checked={paymentMethod === 'Credit Card'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="custom-radio-label"
                                            />
                                            {paymentMethod === 'creditCard' && (
                                                <div className="payment-details-form p-3 border rounded mt-2">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Numero Carta</Form.Label>
                                                        <Form.Control type="text" placeholder="XXXX XXXX XXXX XXXX" />
                                                    </Form.Group>
                                                    <Row>
                                                        <Form.Group as={Col} md={6} className="mb-3">
                                                            <Form.Label>Data Scadenza</Form.Label>
                                                            <Form.Control type="text" placeholder="MM/AA" />
                                                        </Form.Group>
                                                        <Form.Group as={Col} md={6} className="mb-3">
                                                            <Form.Label>CVV</Form.Label>
                                                            <Form.Control type="text" placeholder="XXX" />
                                                        </Form.Group>
                                                    </Row>
                                                </div>
                                            )}
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="radio"
                                                id="paymentPayPal"
                                                name="paymentMethod"
                                                label="PayPal"
                                                value="PayPal"
                                                checked={paymentMethod === 'PayPal'}
                                                onChange={handlePaymentMethodChange}
                                                className="custom-radio-label"
                                            />
                                            {paymentMethod === 'PayPal' && (
                                                <div className="payment-details-form p-3 border rounded mt-2">
                                                    <p className="text-muted small m-0">Sarai reindirizzato a PayPal per completare l'acquisto.</p>
                                                </div>
                                            )}
                                        </Form.Group>
                                        {checkoutError && <p className="text-danger small mb-3">{checkoutError}</p>}
                                        <div className="d-flex justify-content-between mt-4">
                                            <Button variant="outline-secondary" onClick={handlePrevStep}>Indietro</Button>
                                            <Button variant="dark" onClick={handleSavePaymentMethod}>Continua</Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            )}
                    </Card>

                    {/* Riepilogo dell'ordine */}
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><BoxFill className="me-2" />3. Riepilogo dell'ordine</h2>
                        </Card.Header>
                        { currentStep === 3 && (
                            <Card.Body>
                                <h4 className="mb-3">Indirizzo di Spedizione</h4>
                                <div className="summary-item mb-3">
                                    <p className="fw-bold">{authUser.firstName} {authUser.lastName}</p>
                                    <p className="mb-1">{deliveryAddress.address} {deliveryAddress.postalCode} {deliveryAddress.city}</p>
                                    <p className="mb-1">{deliveryAddress.country}</p>
                                    <p className="mb-0">Email: {authUser.email}</p>
                                    <p className="mb-3">Cellulare: {deliveryAddress.mobilePhoneNumber}</p>
                                    <Button variant="link" onClick={() => setCurrentStep(1)} className="p-0 edit-summary-btn">Modifica</Button>
                                </div>

                                <h4 className="mb-3 mt-4">Metodo di Pagamento</h4>
                                <div className="summary-item mb-3">
                                    <p className="fw-bold">{paymentMethod === 'Credit Card' ? 'Carta di Credito / Debito' : paymentMethod === 'PayPal' ? 'PayPal' : 'Nessun metodo selezionato'}</p>
                                    {paymentMethod === 'Credit Card' && <p className="mb-0 text-muted small">Pagamento con carta di credito/debito.</p>}
                                    {paymentMethod === 'PayPal' && <p className="mb-0 text-muted small">Pagamento tramite account PayPal.</p>}
                                    <Button variant="link" onClick={() => setCurrentStep(2)} className="p-0 edit-summary-btn">Modifica</Button>
                                </div>

                                <h4 className="mb-3 mt-4">Articoli dell'Ordine</h4>
                                <div className="order-items-summary-list border p-3 rounded mb-4">
                                    {cartItems?.map((item, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <img src={item.variantImageUrl?.url} alt={item.variantImageUrl?.altText} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} />
                                                <div>
                                                    <p className="mb-0 fw-bold">{item.productName}</p>
                                                    <p className="mb-0 text-muted small">{item.variantName} x {item.quantity}</p>
                                                </div>
                                            </div>
                                            
                                            <span className="mb-0 fw-bold">€ {(item.quantity * (item.price?.amount)).toFixed(2).replace('.', ',')}</span>
                                            {/* <span>€ {(item.quantity * (item.pricePerUnit * (item.format.match(/\d+/) ? parseInt(item.format.match(/\d+/)[0]) : 1))).toFixed(2).replace('.', ',')}</span> */}
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-end mt-2">
                                        <Button variant="link" onClick={() => navigate("/cart")} className="p-0 edit-summary-btn">Torna al carrello per modifica gli articoli</Button>
                                    </div>
                                </div>

                                {checkoutError && <p className="text-danger small mb-3">{checkoutError}</p>}
                                
                                <div className="d-flex justify-content-between mt-4">
                                    <Button variant="outline-secondary" onClick={handlePrevStep}>Indietro</Button>
                                    <Button variant="dark" onClick={handleConfirmOrder}>Conferma Ordine</Button>
                                </div>
                            </Card.Body>
                        )}
                    </Card>

                </Col>

                {/* Colonna laterale */}
                <Col md={4}>
                    <Card className="order-summary p-3 sticky-top">
                        <Card.Title className="summary-title mb-3">Il tuo ordine</Card.Title>
                        <div className="cart-items-preview">
                            {cartItems?.map((item, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <div className="d-flex align-items-center">
                                        <img src={item.variantImageUrl?.url} alt={item.variantImageUrl?.altText} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} />
                                        <div>
                                            <p className="mb-0 small fw-bold">{item.brand}</p>
                                            <p className="mb-0 small">{item.productName}</p>
                                            <p className="mb-0 text-muted smaller">{item.variantName}</p>
                                            <p className="mb-0 text-muted smaller">QUANTITÀ {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <p className="mb-0 fw-bold">€ {(item.quantity * (item.price?.amount)).toFixed(2).replace('.', ',')}</p>
                                        {/* <p className="mb-0 fw-bold">€ {(item.quantity * (item.pricePerUnit * (item.format.match(/\d+/) ? parseInt(item.format.match(/\d+/)[0]) : 1))).toFixed(2).replace('.', ',')}</p> */}
                                        {/* <p className="mb-0 text-muted smaller">€ {item.pricePerUnit.toFixed(2).replace('.', ',')} / capsula</p> */}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-details mt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Totale provvisorio</span>
                                <span>€ {(subtotal ||0).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                <span>Spese di spedizione <i className="bi bi-info-circle-fill text-muted" title="3 giorni lavorativi"></i></span>
                                <span className="text-success">Gratuita</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                                <span>Totale</span>
                                <span>€ {(total || 0).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <p className="text-muted small text-end">IVA inclusa</p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default CheckoutPage;