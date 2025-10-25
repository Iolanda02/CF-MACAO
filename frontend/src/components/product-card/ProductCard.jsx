import { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router";
import { CartPlusFill, Dash, Plus } from "react-bootstrap-icons";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../modals/LoginModal";
import { useToast } from "../../contexts/ToastContext";
import defaultProductImage from '../../assets/no-image.png';
import "./styles.css";
import RegisterModal from "../modals/RegistrerModal";
import { registerApi } from "../../api/authentication";


function ProductCard({ product }) {
    const { addItemToCart, isLoading, error } = useCart();
    const { isAuthenticated, authUser, login } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [mainImage, setMainImage] = useState(product.variants[0]?.images?.[0]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { addToast } = useToast();
    
    const currentPrice = selectedVariant?.price?.amount;
    const currentStock = selectedVariant?.stock?.quantity;

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
        <Card className="h-100 shadow-sm">
            <Card.Img variant="top" src={mainImage?.url || defaultProductImage} 
                alt={mainImage?.altText || `Immagine per ${product.name}`} style={{ height: '200px', objectFit: 'cover' }} />
            <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2">
                    <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                        {product.name}
                    </Link>
                </Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                    {product.description?.length > 100 ?
                        `${product.description.substring(0, 100)}...` :
                        product.description}
                </Card.Text>
                
                {/* Selezione del formato */}
                <div className="mb-2">
                    <strong>Formato:</strong>
                    <Form.Select
                        size="sm"
                        className="mt-1"
                        value={selectedVariant?._id || ''}
                        onChange={(e) => handleVariantChange(e.target.value)}
                    >
                        {product.variants?.map(variant => (
                            <option key={variant._id} value={variant._id}>
                                {variant.name}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <h5 className="text-end mb-3">
                    €{currentPrice?.toFixed(2)}
                </h5>

                {/* Controlli quantità e pulsante aggiungi al carrello */}
                <div className="d-flex align-items-center justify-content-between mt-auto">
                    <InputGroup className="w-auto me-3">
                        <Button variant="outline-secondary" 
                            onClick={() => handleQuantityChange(-1)}
                            disabled={isLoading || !selectedVariant || quantity <= 1}
                        ><Dash /></Button>
                        <Form.Control type="text" readOnly value={quantity}  className="text-center" style={{ maxWidth: '60px' }} />
                        <Button variant="outline-secondary" 
                            onClick={() => handleQuantityChange(1)}
                            disabled={isLoading || !selectedVariant || quantity >= currentStock}
                        ><Plus /></Button>
                    </InputGroup>
                    <Button
                        variant="outline-secondary"
                        onClick={handleAddToCart}
                        className="ms-2"
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