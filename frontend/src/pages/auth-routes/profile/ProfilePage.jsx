import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Image, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import "./styles.css";
import AddressForm from "./AddressForm";
import { useAuth } from "../../../contexts/AuthContext";
import { profile } from "../../../api/authentication";
import { ArrowLeft, PencilFill, PersonCircle, TrashFill, XCircleFill } from "react-bootstrap-icons";


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
            street: '',
            city: '',
            zipCode: '',
            province: '',
            country: ''
        }
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const { authUser, setAuthUser, setToken } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); 

    
    useEffect(() => {
        if (authUser?._id) {
            readUserProfile(authUser._id);
        } else if (id) {
            readUserProfile(id);
        } else {
            setError("Nessun utente specificato o autenticato.");
            setLoading(false);
        }
    }, [authUser, id]);

        
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
                shippingAddress: result.shippingAddress || { street: '', city: '', zipCode: '', province: '', country: '' }
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
            setPreviewUrl(user.avatar?.url || null);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setPreviewUrl(null); // invio una richiesta al backend per rimuovere l'avatar anche lì?
    };
    
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm()) return;

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
            const result = await updateUserProfile(user._id, profileUpdateData);
            updatedUser = { ...updatedUser, ...result };

            if (avatarFile) {
                const formDataForAvatar = new FormData();
                formDataForAvatar.append('avatar', avatarFile);
                const avatarResult = await uploadAvatar(user._id, formDataForAvatar);
                updatedUser = { ...updatedUser, avatar: avatarResult.avatar };
            } else if (previewUrl === null && user.avatar?.url) {
                 // Se l'avatar è stato rimosso e prima c'era un URL, invia una richiesta per rimuoverlo dal backend
                 // DEVI IMPLEMENTARE LA LOGICA NELLA TUA API updateUserProfile o in una funzione dedicata
                //  const avatarRemoveResult = await updateUserProfile(user._id, { avatar: { url: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg', public_id: null } });
                //  updatedUser = { ...updatedUser, avatar: avatarRemoveResult.avatar };
            }

            setUser(updatedUser);
            setAuthUser(updatedUser);
            setIsEdit(false);
            setAvatarFile(null);
            setPreviewUrl(updatedUser.avatar?.url || null);
        } catch (err) {
            setError("Errore durante l'aggiornamento del profilo.");
            console.error("Errore aggiornamento profilo:", err);
        } finally {
            setLoading(false);
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
            shippingAddress: user.shippingAddress || { street: '', city: '', zipCode: '', province: '', country: '' }
        });
    }

    async function handleDeleteAccount() {
        if (window.confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) {
            setLoading(true);
            setError(null);
            try {
                await deleteUserAccount(user._id);
                localStorage.removeItem('token');
                setToken(null);
                setAuthUser(null);
                navigate("/");
            } catch (err) {
                setError("Errore durante l'eliminazione dell'account.");
                console.error("Errore eliminazione account:", err);
            } finally {
                setLoading(false);
            }
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
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Si è verificato un problema</Alert.Heading>
                    <div>{error}</div>
                </Alert>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="info">
                    <Alert.Heading>Nessun profilo trovato</Alert.Heading>
                    <p>Impossibile caricare i dati dell'utente.</p>
                </Alert>
            </Container>
        );
    }

    const canEdit = authUser && authUser._id === user._id;

    return (
        <div className="user-profile-root py-4">
            <Container>
                <div className="d-flex mb-3">
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        <ArrowLeft className="me-2" />Torna alla home
                    </Button>
                </div>
                <h1 className='pb-4'>Il Mio Profilo</h1>

                <Row className='align-items-center mb-4'>
                    <Col xs={12} md={3} className='d-flex justify-content-center justify-content-md-start mb-3 mb-md-0 position-relative'>
                        {previewUrl ? (
                            <Image src={previewUrl} roundedCircle fluid style={{ width: '150px', height: '150px', objectFit: 'cover' }} alt="Avatar utente" />
                        ) : (
                            <PersonCircle size={150} className="text-secondary" />
                        )}
                        {isEdit && previewUrl && (
                            <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={handleRemoveAvatar}>
                                <XCircleFill />
                            </Button>
                        )}
                    </Col>
                    <Col xs={12} md={9} className='d-flex justify-content-center justify-content-md-end'>
                        {canEdit && !isEdit && (
                            <Button variant="outline-primary" onClick={() => setIsEdit(true)}>
                                <PencilFill className="me-2" /> Modifica Profilo
                            </Button>
                        )}
                    </Col>
                </Row>

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
                                <Button type="submit" variant="primary">
                                    Salva Modifiche
                                </Button>
                            </Form.Group>
                        )}
                        {canEdit && !isEdit && (
                             <Form.Group className="d-flex justify-content-end mt-4">
                                <Button variant="danger" onClick={handleDeleteAccount} className="ms-2">
                                    <TrashFill className="me-2" /> Elimina Profilo
                                </Button>
                             </Form.Group>
                        )}
                    </Form>
                </Card>
            </Container>
        </div>
    )
}

export default ProfilePage;