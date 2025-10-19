import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

function AdminProductsViewPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            getProductDetails(id);
        }
    }, [id, getProductDetails]);

        
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
            navigate('/404', { replace: true });
        } finally {
            setLoading(false);
        }
    }, []);
    
    if (loading) 
        return <Container className="my-4"><h3>Caricamento prodotto...</h3></Container>;
    if (error) 
        return <Container className="my-4"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) 
        return <Container className="my-4"><Alert variant="info">Prodotto non disponibile.</Alert></Container>;

    // Formattazione delle date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container className="my-4">
        <Row className="mb-4 align-items-center">
            <Col>
            <h2>Dettagli Prodotto: {product.name}</h2>
            </Col>
            <Col xs="auto">
            <Button variant="info" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                <PencilFill className="me-2" />Modifica Prodotto
            </Button>
            </Col>
        </Row>

        <Card className="mb-4">
            <Card.Header as="h5">Informazioni Generali</Card.Header>
            <Card.Body>
            <ListGroup variant="flush">
                <ListGroup.Item><strong>ID:</strong> {product.id}</ListGroup.Item>
                <ListGroup.Item><strong>Nome:</strong> {product.name}</ListGroup.Item>
                {/* <ListGroup.Item><strong>Slug:</strong> {product.slug}</ListGroup.Item> */}
                <ListGroup.Item><strong>Brand:</strong> {product.brand || 'N/A'}</ListGroup.Item>
                <ListGroup.Item><strong>Descrizione:</strong> {product.description || 'Nessuna descrizione.'}</ListGroup.Item>
                <ListGroup.Item><strong>Tipo di Prodotto:</strong> {product.itemType}</ListGroup.Item>
                <ListGroup.Item><strong>Stato:</strong> {product.isActive ? 'Attivo' : 'Inattivo'}</ListGroup.Item>
                <ListGroup.Item><strong>Tags:</strong> {product.tags && product.tags.length > 0 ? product.tags.join(', ') : 'N/A'}</ListGroup.Item>
                <ListGroup.Item><strong>Creato il:</strong> {formatDate(product.createdAt)}</ListGroup.Item>
                <ListGroup.Item><strong>Ultima Modifica:</strong> {formatDate(product.updatedAt)}</ListGroup.Item>
            </ListGroup>
            </Card.Body>
        </Card>

        {/* Dettagli specifici per Coffee Capsule */}
        {product.itemType === 'coffee_capsule' && (
            <Card className="mb-4">
            <Card.Header as="h5">Dettagli Capsula di Caffè</Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                <ListGroup.Item><strong>Intensità:</strong> {product.intensity || 'N/A'}</ListGroup.Item>
                <ListGroup.Item><strong>Livello di Tostatura:</strong> {product.roastLevel || 'N/A'}</ListGroup.Item>
                <ListGroup.Item><strong>Miscela:</strong> {product.blend || 'N/A'}</ListGroup.Item>
                <ListGroup.Item><strong>Profilo Aromatico:</strong> {product.aromaProfile || 'N/A'}</ListGroup.Item>
                <ListGroup.Item>
                    <strong>Sistemi Compatibili:</strong>{' '}
                    {product.systemCompatibility && product.systemCompatibility.length > 0
                    ? product.systemCompatibility.join(', ')
                    : 'N/A'}
                </ListGroup.Item>
                </ListGroup>
            </Card.Body>
            </Card>
        )}

        {/* Dettagli delle Varianti */}
        <Card className="mb-4">
            <Card.Header as="h5">Varianti Prodotto ({product.variants ? product.variants.length : 0})</Card.Header>
            <Card.Body>
            {product.variants && product.variants.length > 0 ? (
                <ListGroup>
                {product.variants.map((variant) => (
                    <ListGroup.Item key={variant._id}>
                    <strong>Nome Variante:</strong> {variant.name} <br/>
                    <strong>SKU:</strong> {variant.sku || 'N/A'} <br/>
                    <strong>Prezzo:</strong> €{variant.price ? variant.price.amount.toFixed(2) : 'N/A'} ({variant.price ? variant.price.currency : 'N/A'}) <br/>
                    <strong>Disponibilità:</strong> {variant.stock ? variant.stock.quantity : 'N/A'} <br/>
                    {product.itemType === 'coffee_capsule' && variant.capsulePerPack && (
                        <><strong>Capsule per Confezione:</strong> {variant.capsulePerPack} <br/></>
                    )}
                    </ListGroup.Item>
                ))}
                </ListGroup>
            ) : (
                <p>Nessuna variante disponibile per questo prodotto.</p>
            )}
            </Card.Body>
        </Card>

        {/* <Card className="mb-4">
            <Card.Header as="h5">Recensioni ({product.reviews ? product.reviews.length : 0})</Card.Header>
            <Card.Body>
            {product.reviews && product.reviews.length > 0 ? (
                <ListGroup>
                {product.reviews.map((reviewId, index) => (
                    <ListGroup.Item key={index}>
                    ID Recensione: {reviewId}
                    </ListGroup.Item>
                ))}
                </ListGroup>
            ) : (
                <p>Nessuna recensione per questo prodotto.</p>
            )}
            </Card.Body>
        </Card> */}

        <Button variant="secondary" onClick={() => navigate('/admin/products')} className="mt-3">
            Torna alla Lista Prodotti
        </Button>
        </Container>
    )
}

export default AdminProductsViewPage;