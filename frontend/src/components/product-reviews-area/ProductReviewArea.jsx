import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ListGroup } from "react-bootstrap";

function ProductReviewsArea({ productId }) {
    const { authUser, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newReviewText, setNewReviewText] = useState("");
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingReviewText, setEditingReviewText] = useState("");
    const [editingReviewRating, setEditingReviewRating] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const fetchReviews = useCallback(async () => {
        try {
            const fetchedReviews = await getReviewsByProductId(productId);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    }, [productId]);

    const handlePostReview = async () => {
        if (!newReviewText.trim() || newReviewRating === 0) {
            alert("Per favore, inserisci un testo e un rating per la recensione.");
            return;
        }
        try {
            await createReview(productId, { text: newReviewText, rating: newReviewRating });
            setNewReviewText("");
            setNewReviewRating(0);
            fetchReviews();
        } catch (error) {
            console.error("Error posting review:", error);
            alert("Errore durante l'invio della recensione.");
        }
    };

    const handleEditReviewClick = (review) => {
        setEditingReviewId(review._id);
        setEditingReviewText(review.text);
        setEditingReviewRating(review.rating);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditingReviewText("");
        setEditingReviewRating(0);
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editingReviewText.trim() || editingReviewRating === 0) {
            alert("Per favore, inserisci un testo e un rating per la recensione modificata.");
            return;
        }
        try {
            await editReview(productId, reviewId, { text: editingReviewText, rating: editingReviewRating });
            handleCancelEdit();
            fetchReviews();
        } catch (error) {
            console.error("Error updating review:", error);
            alert("Errore durante la modifica della recensione.");
        }
    };

    const handleRemoveReview = async (reviewId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa recensione?")) {
            try {
                await removeReview(productId, reviewId);
                fetchReviews();
            } catch (error) {
                console.error("Error removing review:", error);
                alert("Errore durante l'eliminazione della recensione.");
            }
        }
    };

    // Funzione per renderizzare le stelle del rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarFill
                    key={i}
                    className={i <= rating ? "text-warning" : "text-secondary"}
                    style={{ cursor: editingReviewId === null ? 'pointer' : 'default' }}
                    onClick={() => {
                        if (editingReviewId === null) {
                            setNewReviewRating(i);
                        } else if (editingReviewId !== null && i <= 5) {
                            setEditingReviewRating(i);
                        }
                    }}
                />
            );
        }
        return stars;
    };

    // Renderizza le stelle per il rating della nuova recensione
    const renderNewReviewStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarFill
                    key={i}
                    className={i <= newReviewRating ? "text-warning" : "text-secondary"}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setNewReviewRating(i)}
                />
            );
        }
        return stars;
    };


    return (
        <Container className="px-0 py-5">
            <h2 className="mb-4">Recensioni dei Clienti</h2>
            <Row>
                <Col md={7} className="pb-3">
                    {reviews.length === 0 && <Alert variant="info">Nessuna recensione ancora. Sii il primo a recensire questo prodotto!</Alert>}
                    <ListGroup variant="flush">
                        {reviews.map((review) => (
                            <ListGroup.Item key={review._id} className="d-flex flex-column mb-3 border rounded shadow-sm p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <strong>{review.author.nome} {review.author.cognome}</strong>
                                        <span className="text-muted ms-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        {renderStars(review.rating)}
                                        {isAuthenticated && authUser?._id === review.author._id && (
                                            <>
                                                {editingReviewId === review._id ? (
                                                     <Button variant="outline-success" size="sm" className="ms-2" onClick={() => handleUpdateReview(review._id)}>Salva</Button>
                                                ) : (
                                                    <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => handleEditReviewClick(review)}>
                                                        <PencilFill />
                                                    </Button>
                                                )}
                                                {editingReviewId === review._id ? (
                                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleCancelEdit}>Annulla</Button>
                                                ) : (
                                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleRemoveReview(review._id)}>
                                                        <TrashFill />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {editingReviewId === review._id ? (
                                    <>
                                        <Form.Group className="mb-2">
                                            <div className="d-flex mb-2">{renderStars(editingReviewRating)}</div> 
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={editingReviewText}
                                                onChange={(e) => setEditingReviewText(e.target.value)}
                                            />
                                        </Form.Group>
                                    </>
                                ) : (
                                    <p className="mb-0">{review.text}</p>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Form per lasciare una nuova recensione */}
                <Col md={5}>
                    {isAuthenticated ? (
                        <Card className="p-3 shadow-sm">
                            <Card.Title className="mb-3">Lascia la tua recensione</Card.Title>
                            <Form.Group className="mb-3">
                                <Form.Label>Il tuo voto:</Form.Label>
                                <div className="d-flex gap-1 mb-2">
                                    {renderNewReviewStars()}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Il tuo commento:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={newReviewText}
                                    onChange={(e) => setNewReviewText(e.target.value)}
                                    placeholder="Condividi la tua opinione su questo prodotto..."
                                />
                            </Form.Group>
                            <Button variant="primary" onClick={handlePostReview} disabled={!newReviewText.trim() || newReviewRating === 0}>
                                Invia
                            </Button>
                        </Card>
                    ) : (
                        <Alert variant="info" className="text-center">
                            <Link to="/login" className="alert-link">Accedi</Link> per lasciare una recensione.
                        </Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default ProductReviewsArea;