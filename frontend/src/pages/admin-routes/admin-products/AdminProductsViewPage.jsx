import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap";
import { getProduct } from "../../../api/product";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, PencilFill } from "react-bootstrap-icons";

function AdminProductsViewPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(false);
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
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate("/admin/items")} className="mt-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
            </Container>
        );
    }

    if (!product) 
        return <Container className="my-4"><Alert variant="info">Prodotto non disponibile.</Alert></Container>;

    // Formattazione delle date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container className="mt-4">
        
        <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="secondary" onClick={() => navigate('/admin/products')} className="mt-3">
                Torna alla Lista Prodotti
            </Button>
            <Button variant="info" onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                <PencilFill className="me-2" />Modifica Prodotto
            </Button>
        </div>
            
        <h1>Dettagli Prodotto: {product.name}</h1>

        <Card className="my-4">
            <Card.Header as="h5">Informazioni Generali</Card.Header>
            <Card.Body>
            <ListGroup variant="flush">
                <ListGroup.Item><strong>ID:</strong> {product._id}</ListGroup.Item>
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

        </Container>
    )
}

export default AdminProductsViewPage;