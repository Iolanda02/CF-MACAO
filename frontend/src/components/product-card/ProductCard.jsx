import { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { Form } from "react-router";
import "./styles.css";


export const useCart = () => {
    const addToCart = (product, quantity, format) => {
        console.log(`Aggiunto ${quantity} di ${product.name} (${format} capsule) al carrello.`);
        // Logica per aggiungere al carrello globale
    };
    return { addToCart };
};

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState(product.formats[0].quantity);

    useEffect(() => {
        setQuantity(1);
        setSelectedFormat(product.formats[0].quantity);
    }, [product.id, product.formats]);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedFormat);
        // Feedback visivo (es. toast) da aggiungere
    };

    // Trova il prezzo del pacco selezionato
    const currentPrice = product.formats.find(f => f.quantity === selectedFormat)?.pricePerPack || product.price;

    return (
        <Card className="h-100 shadow-sm">
            <Card.Img variant="top" src={product.image?.path} alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
            <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                        {product.name}
                    </Link>
                </Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                    {product.description.length > 100 ?
                        `${product.description.substring(0, 100)}...` :
                        product.description}
                </Card.Text>
                
                {/* Selezione del formato */}
                <div className="mb-2">
                    <strong>Formato:</strong>
                    <Form.Select
                        size="sm"
                        className="mt-1"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(parseInt(e.target.value))}
                    >
                        {product.formats.map(format => (
                            <option key={format.quantity} value={format.quantity}>
                                {format.quantity} capsule (€{format.pricePerPack.toFixed(2)})
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <h5 className="text-end mb-3">
                    €{currentPrice.toFixed(2)}
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
                    >
                        <CartPlusFill className="me-1" /> Aggiungi
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default ProductCard;