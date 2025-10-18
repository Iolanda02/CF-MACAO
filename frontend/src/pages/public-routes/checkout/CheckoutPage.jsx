import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "./styles.css";


function CheckoutPage() {
    const [cartItems, setCartItems] = useState(initialCartItems);

     const [deliveryAddress, setDeliveryAddress] = useState({
        firstName: 'Sara',
        lastName: 'Rossini',
        email: 's.rossini@mail.com',
        confirmEmail: 's.rossini@mail.com',
        address: '',
        cap: '',
        city: '',
        province: '',
        country: '',
        mobilePhonePrefix: '',
        mobilePhoneNumber: '',
        fixedPhonePrefix: '',
        fixedPhoneNumber: '',
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false); 
    const [paymentMethod, setPaymentMethod] = useState(''); 

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = () => {
        console.log("Indirizzo salvato:", deliveryAddress);
        setIsEditingAddress(false);
    };

    const handleConfirmOrder = () => {
        alert("Ordine Confermato!");
        // Qui invieresti l'ordine al backend
        console.log("Ordine da inviare:", {
            deliveryAddress,
            paymentMethod,
            cartItems,
            total
        });
    };

    return (
        <Container className="checkout-page my-5">
            <Row>
                <Col>
                    <h1 className="checkout-title mb-4">Checkout</h1>
                    <p className="checkout-summary">{cartItems.length} Articoli | € {subtotal.toFixed(2).replace('.', ',')}</p>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={8}>
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><TruckFill className="me-2" /> 1. Opzioni di consegna</h2>
                        </Card.Header>
                        <Card.Body>
                            {!isEditingAddress ? (
                                <div className="delivery-address-display">
                                    <p className="fw-bold">{deliveryAddress.firstName} {deliveryAddress.lastName}</p>
                                    <p>{deliveryAddress.address}, {deliveryAddress.cap} {deliveryAddress.city} ({deliveryAddress.province})</p>
                                    <p>{deliveryAddress.country}</p>
                                    <p>Email: {deliveryAddress.email}</p>
                                    <p>Cellulare: {deliveryAddress.mobilePhonePrefix}{deliveryAddress.mobilePhoneNumber}</p>
                                    <Button variant="link" onClick={() => setIsEditingAddress(true)} className="p-0 edit-address-btn">
                                        <GeoAltFill className="me-1" /> Aggiungi o Modifica indirizzo
                                    </Button>
                                    <div className="d-flex justify-content-end mt-4">
                                        <Button variant="dark" onClick={handleNextStep}>Continua</Button>
                                    </div>
                                </div>
                            ) : (<Form>
                                    <h4 className="mb-3">Indirizzo di spedizione</h4>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Nome*</Form.Label>
                                            <Form.Control type="text" name="firstName" value={deliveryAddress.firstName} onChange={handleAddressChange} required />
                                        </Form.Group>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Cognome*</Form.Label>
                                            <Form.Control type="text" name="lastName" value={deliveryAddress.lastName} onChange={handleAddressChange} required />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Email*</Form.Label>
                                            <Form.Control type="email" name="email" value={deliveryAddress.email} onChange={handleAddressChange} required />
                                        </Form.Group>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Conferma Email*</Form.Label>
                                            <Form.Control type="email" name="confirmEmail" value={deliveryAddress.confirmEmail} onChange={handleAddressChange} required />
                                        </Form.Group>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Indirizzo*</Form.Label>
                                        <Form.Control type="text" name="address" value={deliveryAddress.address} onChange={handleAddressChange} required />
                                    </Form.Group>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>CAP*</Form.Label>
                                            <Form.Control type="text" name="cap" value={deliveryAddress.cap} onChange={handleAddressChange} required />
                                        </Form.Group>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Città*</Form.Label>
                                            <Form.Control type="text" name="city" value={deliveryAddress.city} onChange={handleAddressChange} required />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Provincia*</Form.Label>
                                            <Form.Control type="text" name="province" value={deliveryAddress.province} onChange={handleAddressChange} required />
                                        </Form.Group>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Nazione*</Form.Label>
                                            <Form.Control type="text" name="country" value={deliveryAddress.country} onChange={handleAddressChange} required />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Cellulare**</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>{deliveryAddress.mobilePhonePrefix}</InputGroup.Text>
                                                <Form.Control type="tel" name="mobilePhoneNumber" value={deliveryAddress.mobilePhoneNumber} onChange={handleAddressChange} />
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Telefono Fisso**</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>{deliveryAddress.fixedPhonePrefix || 'N/A'}</InputGroup.Text>
                                                <Form.Control type="tel" name="fixedPhoneNumber" value={deliveryAddress.fixedPhoneNumber} onChange={handleAddressChange} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Row>
                                    <p className="small text-muted mb-1">*Questo campo è obbligatorio.</p>

                                    <div className="d-flex justify-content-between mt-4">
                                        {isEditingAddress && <Button variant="secondary" onClick={() => setIsEditingAddress(false)}>Annulla</Button>}
                                        <Button variant="dark" onClick={handleSaveAddress}>Salva</Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Pagamento */}
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><CreditCardFill className="me-2" />Pagamento</h2>
                        </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="radio"
                                            id="paymentCreditCard"
                                            name="paymentMethod"
                                            label="Carta di Credito / Debito"
                                            value="creditCard"
                                            checked={paymentMethod === 'creditCard'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="custom-radio-label"
                                        />
                                        {paymentMethod === 'creditCard' && (
                                            <div className="payment-details-form p-3 border rounded mt-2">
                                                {/* Qui inseriresti il form per i dettagli della carta */}
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
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="custom-radio-label"
                                        />
                                        {paymentMethod === 'paypal' && (
                                            <div className="payment-details-form p-3 border rounded mt-2">
                                                <p className="text-muted small">Sarai reindirizzato a PayPal per completare l'acquisto.</p>
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* <div className="d-flex justify-content-between mt-4">
                                        <Button variant="outline-secondary" onClick={handlePrevStep}>Indietro</Button>
                                        <Button variant="dark" onClick={handleNextStep}>Continua</Button>
                                    </div> */}
                                </Form>
                            </Card.Body>
                    </Card>

                    {/* Riepilogo dell'ordine */}
                    <Card className="checkout-section mb-4">
                        <Card.Header className={`checkout-section-header active`}>
                            <h2 className="fs-5 fw-bold"><BoxFill className="me-2" />Riepilogo dell'ordine</h2>
                        </Card.Header>
                        { true && (
                            <Card.Body>
                                <h4 className="mb-3">Indirizzo di Spedizione</h4>
                                <div className="summary-item mb-3">
                                    <p className="fw-bold">{deliveryAddress.firstName} {deliveryAddress.lastName}</p>
                                    <p className="mb-1">{deliveryAddress.address}, {deliveryAddress.cap} {deliveryAddress.city} ({deliveryAddress.province})</p>
                                    <p className="mb-1">{deliveryAddress.country}</p>
                                    <p className="mb-0">Email: {deliveryAddress.email}</p>
                                    <p className="mb-3">Cellulare: {deliveryAddress.mobilePhonePrefix}{deliveryAddress.mobilePhoneNumber}</p>
                                    <Button variant="link" onClick={() => setCurrentStep(1)} className="p-0 edit-summary-btn">Modifica</Button>
                                </div>

                                <h4 className="mb-3 mt-4">Metodo di Pagamento</h4>
                                <div className="summary-item mb-3">
                                    <p className="fw-bold">{paymentMethod === 'creditCard' ? 'Carta di Credito / Debito' : paymentMethod === 'paypal' ? 'PayPal' : 'Nessun metodo selezionato'}</p>
                                    {paymentMethod === 'creditCard' && <p className="mb-0 text-muted small">Pagamento con carta di credito/debito.</p>}
                                    {paymentMethod === 'paypal' && <p className="mb-0 text-muted small">Pagamento tramite account PayPal.</p>}
                                    <Button variant="link" onClick={() => setCurrentStep(2)} className="p-0 edit-summary-btn">Modifica</Button>
                                </div>

                                <h4 className="mb-3 mt-4">Articoli dell'Ordine</h4>
                                <div className="order-items-summary-list border p-3 rounded mb-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} />
                                                <div>
                                                    <p className="mb-0 fw-bold">{item.name}</p>
                                                    <p className="mb-0 text-muted small">{item.format} x {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span>€ {(item.quantity * (item.pricePerUnit * (item.format.match(/\d+/) ? parseInt(item.format.match(/\d+/)[0]) : 1))).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    ))}
                                    <div className="d-flex justify-content-end mt-2">
                                        <Button variant="link" onClick={() => alert("Torna al carrello per modificare gli articoli!")} className="p-0 edit-summary-btn">Modifica Articoli</Button>
                                    </div>
                                </div>


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
                            {cartItems.map(item => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <div className="d-flex align-items-center">
                                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} />
                                        <div>
                                            <p className="mb-0 small fw-bold">{item.brand}</p>
                                            <p className="mb-0 small">{item.name}</p>
                                            <p className="mb-0 text-muted smaller">{item.format}</p>
                                            <p className="mb-0 text-muted smaller">QUANTITÀ {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <p className="mb-0 fw-bold">€ {(item.quantity * (item.pricePerUnit * (item.format.match(/\d+/) ? parseInt(item.format.match(/\d+/)[0]) : 1))).toFixed(2).replace('.', ',')}</p>
                                        {/* <p className="mb-0 text-muted smaller">€ {item.pricePerUnit.toFixed(2).replace('.', ',')} / capsula</p> */}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-details mt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Totale provvisorio</span>
                                <span>€ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                <span>Spese di spedizione <i className="bi bi-info-circle-fill text-muted" title="3 giorni lavorativi"></i></span>
                                <span className="text-success">Gratuita</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                                <span>Totale</span>
                                <span>€ {total.toFixed(2).replace('.', ',')}</span>
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