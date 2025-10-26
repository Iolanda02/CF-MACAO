import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import { PencilFill, StarFill, TrashFill } from "react-bootstrap-icons";
import { Link } from "react-router";
import { createReview, removeReview, updateReview } from "../../api/review";
import { useToast } from "../../contexts/ToastContext";
import DeleteModal from "../modals/DeleteModal";

function ProductReviewsArea({ productId, productReviews }) {
    const { authUser, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState(productReviews);
    const [newReviewText, setNewReviewText] = useState("");
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingReviewText, setEditingReviewText] = useState("");
    const [editingReviewRating, setEditingReviewRating] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const { addToast } = useToast();

    // const fetchReviews = useCallback(async () => {
    //     try {
    //         const fetchedReviews = await getReviewsByProductId(productId);
    //         setReviews(fetchedReviews);
    //     } catch (error) {
    //         console.error("Error fetching reviews:", error);
    //         addToast("Errore durante il caricamento delle recensioni.", "danger");
    //     }
    // }, [productId]);
    
    useEffect(() => {
        if (productReviews.length !== reviews.length || productReviews.some((pr, i) => pr._id !== reviews[i]?._id)) {
            setReviews(productReviews);
        }
    }, [productReviews, reviews]);

    const handlePostReview = async () => {
        try {
            const newReview = await createReview({item: productId, comment: newReviewText, rating: newReviewRating });
            setNewReviewText("");
            setNewReviewRating(0);
            addToast("Recensione salvata con successo!", "success");
            setReviews(prevReviews => [...prevReviews, newReview]);
        } catch (error) {
            console.error("Error posting review:", error);
            addToast("Errore durante l'invio della recensione. Riprova più tardi.", "danger");
        }
    };

    const handleEditReviewClick = (review) => {
        setEditingReviewId(review._id);
        setEditingReviewText(review.comment);
        setEditingReviewRating(review.rating);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditingReviewText("");
        setEditingReviewRating(0);
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            const updatedReview = await updateReview(reviewId, { comment: editingReviewText, rating: editingReviewRating });
            addToast("Recensione modificata con successo!", "info");
            handleCancelEdit();
            setReviews(prevReviews => 
                prevReviews.map(rev => (rev._id === reviewId ? { ...rev, ...updatedReview } : rev))
            );
        } catch (error) {
            console.error("Error updating review:", error);
            addToast("Errore durante la modifica della recensione. Riprova più tardi.", "danger");
        }
    };

    const handleRemoveReview = async (reviewId) => {
        try {
            await removeReview(commentToDelete._id);
            addToast("Recensione eliminata con successo!", "info");
            setReviews(prevReviews => prevReviews.filter(rev => rev._id !== commentToDelete._id));
            setShowDeleteModal(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error("Error removing review:", error);
            addToast("Errore durante l'eliminazione della recensione. Riprova più tardi.", "danger");
        }
    };
    
    const handleDelete = (comment) => {
        setCommentToDelete(comment);
        setShowDeleteModal(true);
    };

    // Funzione per renderizzare le stelle del rating
    const renderStars = (currentRating, setRating = null, disabled = false) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarFill
                    key={i}
                    className={i <= currentRating ? "text-warning" : "text-secondary"}
                    style={{ cursor: setRating && !disabled ? 'pointer' : 'default' }}
                    onClick={() => setRating && !disabled && setRating(i)}
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
                        {reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((review, index) => (
                            <ListGroup.Item key={index} className="d-flex flex-column mb-3 border rounded shadow-sm p-3">
                                <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                                    <div>
                                        <strong>{review.user?.firstName || ''} {review.user?.lastName || ''}</strong>
                                        <span className="text-muted ms-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        {editingReviewId === review._id ? 
                                            // Stelle editabili in modalità editing
                                            renderStars(editingReviewRating, setEditingReviewRating) 
                                            : 
                                            // Stelle non editabili in modalità visualizzazione
                                            renderStars(review.rating, null, true)
                                        }
                                        
                                        {isAuthenticated && authUser?._id === review.user?._id && (
                                            <>
                                                {editingReviewId === review._id ? (
                                                    <>
                                                        <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => handleUpdateReview(review._id)}>Salva</Button>
                                                        <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleCancelEdit}>Annulla</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => handleEditReviewClick(review)}>
                                                            <PencilFill />
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(review)}>
                                                            <TrashFill />
                                                        </Button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {editingReviewId === review._id ? (
                                    <>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={editingReviewText}
                                                onChange={(e) => setEditingReviewText(e.target.value)}
                                            />
                                        </Form.Group>
                                    </>
                                ) : (
                                    <p className="mb-0">{review.comment}</p>
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
                                    {renderStars(newReviewRating, setNewReviewRating)}
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
                            <Button variant="dark" onClick={handlePostReview} disabled={!newReviewText.trim() && newReviewRating === 0}>
                                Invia
                            </Button>
                        </Card>
                    ) : (
                        <Alert variant="info" className="text-center">
                            Accedi per lasciare una recensione.
                        </Alert>
                    )}
                </Col>
            </Row>
            
            <DeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleRemoveReview}
                textToShow={"Sei sicuro di voler eliminare il commento?"
                }
            />
        </Container>
    );
}

export default ProductReviewsArea;