import { useEffect, useState } from "react";
import { Badge, Button, Card, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router";
import { CartPlusFill, Dash, Plus } from "react-bootstrap-icons";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../modals/LoginModal";
import { useToast } from "../../contexts/ToastContext";
import defaultProductImage from '../../assets/no-image.png';
import RegisterModal from "../modals/RegistrerModal";
import { registerApi } from "../../api/authentication";
import "./styles.css";


function ProductCard({ product }) {
    const { addItemToCart, isLoading } = useCart();
    const { isAuthenticated, login } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [mainImage, setMainImage] = useState(product.variants[0]?.images?.[0]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { addToast } = useToast();
    
    const currentPrice = selectedVariant?.price?.amount;
    const currentStock = selectedVariant?.stock?.quantity;
    const stockStatus = currentStock > 0 ? "Disponibile" : "Esaurito";
    const stockVariant = currentStock > 0 ? "success" : "danger";

    useEffect(() => {
        if (selectedVariant) {
            const mainVarImage = selectedVariant.images?.find(img => img.isMain);
            setMainImage(mainVarImage || selectedVariant.images?.[0] || null);
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
            console.error("Errore durante la registrazione:", loginError);
            addToast("Errore durante la registrazione", "danger");
        }
    };
    
    return (
        <Card className="product-card h-100 shadow border-0 d-flex flex-column">
            <Card.Img variant="top" src={mainImage?.url || defaultProductImage} 
                alt={mainImage?.altText || `Immagine per ${product.name}`} className="product-card-img" />
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 fs-5 fw-bold flex-grow-1">
                        <Link to={`/product/${product._id}`} className="text-decoration-none text-title hover-primary">
                            {product.name}
                        </Link>
                    </Card.Title>
                    <Badge pill bg={stockVariant} className="ms-2 mt-1">
                        {stockStatus}
                    </Badge>
                </div>
                <Card.Text className="text-muted flex-grow-1 mb-3 card-description">
                    {product.description?.length > 70 ?
                        `${product.description.substring(0, 70)}...` :
                        product.description}
                </Card.Text>
                
                {/* Selezione del formato */}
                <div className="mb-3 d-flex flex-column">
                    <span className="text-label me-2">Formato:</span>
                    <Form.Select
                        size="sm"
                        className="flex-grow-1 select-variant"
                        value={selectedVariant?._id || ''}
                        onChange={(e) => handleVariantChange(e.target.value)}
                    >
                        {product.variants?.map(variant => (
                            <option key={variant._id} value={variant._id} className="">
                                {variant.name}
                            </option>
                        ))}
                    </Form.Select>
                </div>


                <div className="d-flex align-items-center justify-content-between mb-3">
                    {currentStock > 0 && (
                    <p className="text-muted mb-0">In magazzino: {currentStock}</p>
                    )}
                    <div className={`d-flex justify-content-end ${currentStock <= 0? "w-100": ""}`}>
                        <h4 className="mb-0 fw-bold">
                            €{currentPrice?.toFixed(2)}
                        </h4>
                    </div>
                </div>

                {/* Controlli quantità e pulsante aggiungi al carrello */}
                <div className="d-flex align-items-center justify-content-between mt-auto">
                    <InputGroup className="w-auto me-3 quantity-control">
                        <Button variant="outline-secondary" 
                            onClick={() => handleQuantityChange(-1)}
                            disabled={isLoading || !selectedVariant || quantity <= 1}
                            className="border-end-0"
                        ><Dash /></Button>
                        <Form.Control type="text" readOnly value={quantity} 
                        disabled={stockStatus === "Esaurito"}  
                        className="text-center quantity-input" />
                        <Button variant="outline-secondary" 
                            onClick={() => handleQuantityChange(1)}
                            disabled={isLoading || !selectedVariant || quantity >= currentStock}
                            className="border-start-0"
                        ><Plus /></Button>
                    </InputGroup>
                    <Button
                        variant="outline-secondary"
                        onClick={handleAddToCart}
                        className="ms-3 flex-grow-1 add-to-cart-btn"
                        disabled={isLoading || !selectedVariant || currentStock <= 0 || quantity > currentStock}
                    >
                        <CartPlusFill className="me-2" /> Aggiungi
                    </Button>
                </div>
            </Card.Body>
            
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
        
        </Card>
    );
}

export default ProductCard;