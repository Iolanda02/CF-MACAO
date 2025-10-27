import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Image, ListGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import "./styles.css";
import AddressForm from "./AddressForm";
import { useAuth } from "../../../contexts/AuthContext";
import { profile } from "../../../api/authentication";
import { ArrowLeft, PencilFill, PersonCircle, TrashFill, XCircleFill } from "react-bootstrap-icons";
import { addAvatar, editUser, removeAvatar, removeUser } from "../../../api/user";
import { useToast } from "../../../contexts/ToastContext";
import DeleteModal from "../../../components/modals/DeleteModal";


function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        shippingAddress: {
            address: '',
            city: '',
            postalCode: '',
            province: '',
            country: ''
        }
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { authUser, setAuthUser, setToken, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    useEffect(() => {
        if (authUser?._id) {
            readUserProfile(authUser._id);
        } else {
            setError("Non è stato possibile recuperare i dati dell'utente. Riprova più tardi.");
            setLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        // Reset messaggi quando si cambia modalità
        setFormErrors({});
        setSuccessMessage(null);
    }, [isEdit]);
        
    async function readUserProfile(id) {
        try {
            setLoading(true);
            setError(null);
            const result = await profile(id);
            setUser(result);
            // Inizializza formData con i valori correnti dell'utente per la modifica
            setFormData({
                firstName: result.firstName || '',
                lastName: result.lastName || '',
                email: result.email || '',
                phone: result.phone || '',
                birthDate: result.birthDate ? new Date(result.birthDate).toISOString().split('T')[0] : '',
                shippingAddress: result.shippingAddress || { address: '', city: '', postalCode: '', province: '', country: '' }
            });
            setPreviewUrl(result.avatar?.url || null);
        } catch (err) {
            setError("Errore durante il caricamento del profilo.");
            console.error("Errore caricamento profilo:", err);
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'Il nome è obbligatorio.';
        if (!formData.lastName.trim()) errors.lastName = 'Il cognome è obbligatorio.';
        // if (!formData.email.trim()) errors.email = 'L\'email è obbligatoria.';
        // else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'L\'email non è valida.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddressChange = (newAddress) => {
        setFormData({
            ...formData,
            shippingAddress: newAddress
        });
    };
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setPreviewUrl(user.avatar?.url);
        }
    };

    const handleRemoveAvatar = async () => {
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await removeAvatar(user._id);
            setUser(updatedUser.data);
            setAuthUser(updatedUser.data);
            setAvatarFile(null);
            setPreviewUrl(updatedUser.avatar?.url || null);
        } catch (err) {
            addToast("Errore durante l'aggiornamento del profilo.", "danger");
            console.error("Errore aggiornamento profilo:", err);
        } finally {
            setLoading(false);
        }
    };
    
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm()) {
            setMessage({ type: 'danger', text: 'Si prega di correggere gli errori nella pagina.' });
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage(null);
        setLoading(true);
        setError(null);
        try {
            let updatedUser = { ...user };

            // Aggiorna i dati del profilo
            const profileUpdateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                birthDate: formData.birthDate,
                shippingAddress: formData.shippingAddress
            };
            const result = await editUser(user._id, profileUpdateData);
            updatedUser = { ...updatedUser, ...result.data };

            if (avatarFile) {
                const formDataForAvatar = new FormData();
                formDataForAvatar.append('avatar', avatarFile);
                const avatarResult = await addAvatar(user._id, formDataForAvatar);
                updatedUser = { ...updatedUser, avatar: avatarResult?.data?.avatar };
            }

            setUser(updatedUser);
            setAuthUser(updatedUser);
            setIsEdit(false);
            setAvatarFile(null);
            setPreviewUrl(updatedUser.avatar?.url || null);
            addToast("Profilo aggiornato con successo!", "success");
        } catch (err) {
            addToast("Errore durante l'aggiornamento del profilo.", "danger");
            console.error("Errore aggiornamento profilo:", err);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    }

    function cancelEditing() {
        setIsEdit(false);
        setAvatarFile(null);
        setPreviewUrl(user.avatar?.url || null);
        setFormErrors({});
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
            shippingAddress: user.shippingAddress || { address: '', city: '', postalCode: '', province: '', country: '' }
        });
    }

    const handleDeleteClick = (user) => {
        setShowDeleteModal(true);
    };

    async function handleDeleteAccount() {
        setLoading(true);
        setError(null);
        try {
            await removeUser(user._id);
            addToast("Profilo eliminato con successo", "info")
            localStorage.removeItem('token');
            setShowDeleteModal(false);
            logout();
            navigate("/");
        } catch (err) {
            addToast("Errore durante l'eliminazione dell'account.", "danger");
            console.error("Errore eliminazione account:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </Spinner>
                <p>Caricamento profilo...</p>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla home
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla home
                </Button>
                <Alert variant="warning">Profilo non trovato.</Alert>
            </Container>
        );
    }

    const canEdit = authUser && authUser._id === user._id;

    return (
        <div className="py-4">
            <Container>

                <div className="d-flex justify-content-between align-items-end my-3">
                    <h1 className='m-0'>Il Mio Profilo</h1>
                    {canEdit && !isEdit && (
                        <div className="d-flex gap-3">
                            <Button variant="outline-secondary" title="Modifica profilo"
                                onClick={() => setIsEdit(true)}
                            >
                                <PencilFill />
                            </Button>
                            <Button variant="outline-danger" onClick={handleDeleteClick} title="Elimina profilo">
                                <TrashFill />
                            </Button>
                        </div>
                    )}
                </div>


                {isEdit ? ( 
                    <>
                    <div className='d-flex mb-4'>
                        {previewUrl ? (
                            <Image src={previewUrl} roundedCircle fluid style={{ width: '150px', height: '150px', objectFit: 'cover' }} alt="Avatar utente" />
                        ) : (
                            <PersonCircle size={150} className="text-secondary" />
                        )}
                        {isEdit && previewUrl && (
                            <Button variant="danger" size="sm" className="h-100" onClick={handleRemoveAvatar}>
                                <XCircleFill />
                            </Button>
                        )}
                    </div>

                    <Card className="p-4 shadow-sm">
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="formFirstName" className="mb-3">
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={isEdit ? formData.firstName : user.firstName}
                                            onChange={handleFormChange}
                                            readOnly={!isEdit}
                                            isInvalid={!!formErrors.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="formLastName" className="mb-3">
                                        <Form.Label>Cognome</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={isEdit ? formData.lastName : user.lastName}
                                            onChange={handleFormChange}
                                            readOnly={!isEdit}
                                            isInvalid={!!formErrors.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="formEmail" className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={isEdit ? formData.email : user.email}
                                            onChange={handleFormChange}
                                            readOnly={!isEdit}
                                            isInvalid={!!formErrors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="formPhone" className="mb-3">
                                        <Form.Label>Telefono</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={isEdit ? formData.phone : (user.phone || 'Non specificato')}
                                            onChange={handleFormChange}
                                            readOnly={!isEdit}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="formBirthDate" className="mb-3">
                                        <Form.Label>Data di Nascita</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="birthDate"
                                            value={isEdit ? formData.birthDate : (user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : 'Non specificata')}
                                            onChange={handleFormChange}
                                            readOnly={!isEdit}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    {isEdit && (
                                        <Form.Group controlId="formAvatar" className="mb-3">
                                            <Form.Label>Cambia Avatar</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </Form.Group>
                                    )}
                                </Col>
                            </Row>

                            <AddressForm 
                                address={isEdit ? formData.shippingAddress : user.shippingAddress} 
                                onChange={handleAddressChange} 
                                readOnly={!isEdit} 
                            />
                            {canEdit && isEdit && (
                                <Form.Group className="d-flex justify-content-end mt-4">
                                    <Button type="button" variant="outline-secondary" onClick={cancelEditing} className="me-2">
                                        Annulla
                                    </Button>
                                    <Button type="submit" variant="secondary">
                                        Salva Modifiche
                                    </Button>
                                </Form.Group>
                            )}
                        </Form>
                    </Card>
                    </>
                ) : (
                    <Card className="my-4">
                        <Card.Body>
                            <Row className="mb-3 align-items-center">
                                <Col md={3} className="text-center">
                                    <Image src={user.avatar?.url || 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg'} roundedCircle className="avatar-user" alt="Immagine Utente" />
                                </Col>
                                <Col md={9}>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="border-0"><strong>Nome:</strong> {user.firstName}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Cognome:</strong> {user.lastName}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Email:</strong> {user.email}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Telefono:</strong> {user.phone || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Data di Nascita:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/A'}</ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>
                            <h5 className="mt-4 mb-3 border-top pt-3">Indirizzo di Spedizione</h5>
                            {user.shippingAddress ? (
                                <>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="border-0"><strong>Indirizzo:</strong> {user.shippingAddress.address || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Città:</strong> {user.shippingAddress.city || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>CAP:</strong> {user.shippingAddress.postalCode || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item className="border-0"><strong>Paese:</strong> {user.shippingAddress.country || 'N/A'}</ListGroup.Item>
                                    </ListGroup>
                                </>
                            ) : (
                                <span>{'N/A'}</span>
                            )}
                        </Card.Body>
                    </Card>
                )
                }
                
                <DeleteModal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                    textToShow={"Sei sicuro di voler eliminare il tuo profilo?"}
                />
            </Container>
        </div>
    )
}

export default ProfilePage;