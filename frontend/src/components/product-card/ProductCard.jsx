import { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router";
import "./styles.css";
import { CartPlusFill, Dash, Plus } from "react-bootstrap-icons";
import { useCart } from "../../contexts/CartContext";


function ProductCard({ product }) {
    const { addItemToCart, isLoading, error } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name || '');
    const [currentPrice, setCurrentPrice] = useState(product.variants[0]?.price?.amount || 0);

    useEffect(() => {
        // Reset di quantità e variante quando cambia il prodotto
        if (product && product.variants && product.variants.length > 0) {
            setQuantity(1);
            setSelectedVariant(product.variants[0].name);
            setCurrentPrice(product.variants[0].price.amount);
        }
    }, [product._id, product.variants]);

    useEffect(() => {
        // Trova il prezzo del pacco selezionato quando cambia la variante
        const variant = product.variants.find(v => v.name === selectedVariant);
        setCurrentPrice(variant?.price?.amount || 0);
    }, [selectedVariant, product.variants])
    
    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };
    
    const handleAddToCart = async () => {
        try {
            // Qui devi passare l'ID del prodotto, la quantità e l'ID della variante selezionata
            const selectedVariantObj = product.variants.find(v => v.name === selectedVariant);
            if (!selectedVariantObj) {
                console.error("Variante selezionata non trovata.");
                return;
            }
            await addItemToCart(product._id, quantity, selectedVariantObj._id);
            // Feedback visivo (es. toast) qui
        } catch (error) {
            console.error("Errore nell'aggiunta al carrello:", error);
        }
    };
    
    return (
        <Card className="h-100 shadow-sm">
            <Card.Img variant="top" src={product.image?.path} alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
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
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                    >
                        {product.variants?.map(variant => (
                            <option key={variant._id} value={variant.name}>
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
                    <InputGroup className="w-auto">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                        >
                            <Dash />
                        </Button>
                        <Form.Control
                            type="text"
                            readOnly
                            value={quantity}
                            className="text-center w-25"
                            style={{ maxWidth: '50px' }}
                        />
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                        >
                            <Plus />
                        </Button>
                    </InputGroup>
                    <Button
                        variant="primary"
                        onClick={handleAddToCart}
                        className="ms-2"
                        disabled={isLoading}
                    >
                        <CartPlusFill className="me-1" /> Aggiungi
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default ProductCard;