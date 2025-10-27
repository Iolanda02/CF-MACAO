import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Image, Row, Spinner } from "react-bootstrap";
import { getProduct } from "../../../api/product";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, PencilFill } from "react-bootstrap-icons";
import "./styles.css";

function AdminProductsViewPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await getProduct(id);
            setProduct(result.data);
        } catch(error) {
            console.error(error);
            setError("Non è stato possibile recuperare i dati del prodotto. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            getProductDetails(id);
        }
    }, [id, getProductDetails]);
        
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
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/products")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista prodotti
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!product) {
        return ( 
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/products")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista prodotti
                </Button>
                <Alert variant="info">Prodotto non disponibile.</Alert>
            </Container>
        )
    }

    // Formattazione delle date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const renderInfoItem = (label, value) => (
        <Col md={6} className="mb-3">
            <strong>{label}:</strong> {value}
        </Col>
    );

    return (
        <Container className="my-4">
            <Button variant="link" onClick={() => navigate('/admin/products')} className="mt-3 text-dark">
                <ArrowLeft className="me-2" />Torna alla Lista Prodotti
            </Button>

            <div className="d-flex justify-content-between align-items-end my-3">
                <h1 className="m-0">Dettagli Prodotto: {product?.name}</h1>
                <Button variant="outline-secondary" title="Modifica prodotto" 
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                    <PencilFill />
                </Button>
            </div>
            
            <Card className="my-4">
                <Card.Header as="h5">Informazioni Generali</Card.Header>
                <Card.Body>
                    <Row> 
                        {renderInfoItem('ID', product._id)}
                        {renderInfoItem('Nome', product.name)}
                        {renderInfoItem('Brand', product.brand || 'N/A')}
                        {renderInfoItem('Tipo di Prodotto', product.itemType)}
                        {renderInfoItem('Stato', product.isActive ? 'Attivo' : 'Inattivo')}
                        {renderInfoItem('Tags', product.tags && product.tags.length > 0 ? product.tags.join(', ') : 'N/A')}
                        {renderInfoItem('Creato il', formatDate(product.createdAt))}
                        {renderInfoItem('Ultima Modifica', formatDate(product.updatedAt))}
                        <Col xs={12} className="mb-3">
                            <strong>Descrizione:</strong> {product.description || 'Nessuna descrizione'}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Dettagli specifici per Coffee Capsule */}
            {product.itemType === 'coffee_capsule' && (
                <Card className="mb-4">
                    <Card.Header as="h5">Dettagli Capsula di Caffè</Card.Header>
                    <Card.Body>
                        <Row>
                            {renderInfoItem('Intensità', product.intensity || 'N/A')}
                            {renderInfoItem('Livello di Tostatura', product.roastLevel || 'N/A')}
                            {renderInfoItem('Miscela', product.blend || 'N/A')}
                            {renderInfoItem('Profilo Aromatico', product.aromaProfile || 'N/A')}
                            <Col xs={12} className="mb-3">
                                <strong>Sistemi Compatibili:</strong>{' '}
                                {product.systemCompatibility && product.systemCompatibility.length > 0
                                ? product.systemCompatibility.join(', ')
                                : 'N/A'}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Dettagli delle Varianti */}
            <Card className="mb-4">
                <Card.Header as="h5">Varianti Prodotto ({product.variants ? product.variants.length : 0})</Card.Header>
                <Card.Body>
                {/* {product.variants && product.variants.length > 0 ? (
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
                )} */}
                {product.variants && product.variants.length > 0 ? (
                    <Row xs={1} md={2} className="g-4">
                    {product.variants.map((variant) => (
                        <Col key={variant._id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-3">{variant.name}</Card.Title>
                                    
                                    {/* Immagini della variante */}
                                    {variant.images && variant.images.length > 0 && (
                                        <div className="mb-3 d-flex flex-wrap gap-2">
                                            {variant.images.map((img, index) => (
                                                <Image 
                                                    key={index} 
                                                    src={img.url} 
                                                    alt={img.altText || `Immagine ${index + 1} di ${variant.name}`} 
                                                    thumbnail 
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '80px', 
                                                        objectFit: 'cover',
                                                        border: img.isMain ? '2px solid var(--bs-dark)' : '1px solid #dee2e6'
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {!variant.images || variant.images.length === 0 && (
                                        <p className="text-muted small">Nessuna immagine per questa variante.</p>
                                    )}
                                    {/* <ListGroup variant="flush">
                                        <ListGroup.Item><strong>SKU:</strong> {variant.sku || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Prezzo:</strong> €{variant.price ? variant.price.amount.toFixed(2) : 'N/A'} ({variant.price ? variant.price.currency : 'N/A'})</ListGroup.Item>
                                        <ListGroup.Item><strong>Sconto:</strong> {variant.discountPrice ? `€${variant.discountPrice.toFixed(2)}` : 'Nessuno'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Disponibilità:</strong> {variant.stock ? variant.stock.quantity : 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Peso:</strong> {variant.weight ? `${variant.weight.value} ${variant.weight.unit}` : 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Colore:</strong> {variant.color || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Misura:</strong> {variant.size || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Ultimo aggiornamento stock:</strong> {formatDate(variant.stock?.lastUpdated)}</ListGroup.Item>
                                    </ListGroup> */}
                                    <Row>
                                        <Col xs={12} className="mb-3"><strong>SKU:</strong> {variant.sku || 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Prezzo:</strong> €{variant.price ? variant.price.amount.toFixed(2) : 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Sconto:</strong> {variant.discountPrice ? `€${variant.discountPrice.toFixed(2)}` : 'Nessuno'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Disponibilità:</strong> {variant.stock ? variant.stock.quantity : 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Peso:</strong> {variant.weight ? `${variant.weight.value} ${variant.weight.unit}` : 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Colore:</strong> {variant.color || 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Misura:</strong> {variant.size || 'N/A'}</Col>
                                        <Col xs={12} className="mb-3"><strong>Ultimo aggiornamento stock:</strong> {formatDate(variant.stock?.lastUpdated)}</Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    </Row>
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

        </Container>
    )
}

export default AdminProductsViewPage;