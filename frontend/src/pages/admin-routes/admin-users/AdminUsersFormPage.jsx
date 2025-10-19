import { Form, useParams } from "react-router";

function AdminUsersFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        birthDate: '',
        avatar: {
            url: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg',
            public_id: null
        },
        shippingAddress: {
            street: '',
            city: '',
            zipCode: '',
            country: '',
        },
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchUserDetails();
        } else {
            setUser({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'user',
                phone: '',
                birthDate: '',
                avatar: {
                    url: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg',
                    public_id: null
                },
                shippingAddress: {
                    street: '',
                    city: '',
                    zipCode: '',
                    country: '',
                },
            });
            setLoading(false);
            setError(null);
            setFormErrors({});
        }
    }, [id, isEditMode]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/admin/users/${id}`);
            const userData = response.data;

            if (userData.birthDate) {
                userData.birthDate = new Date(userData.birthDate).toISOString().split('T')[0];
            }

            if (!userData.shippingAddress) {
                userData.shippingAddress = { street: '', city: '', zipCode: '', country: '' };
            }

            userData.password = '';

            setUser(userData);
        } catch (err) {
            console.error("Errore nel recupero utente per modifica:", err);
            setError("Impossibile caricare i dettagli dell'utente per la modifica.");
            navigate('/404', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));

        // Gestione campi annidati come shippingAddress.street
        if (name.includes('shippingAddress.')) {
            const fieldName = name.split('.')[1];
            setUser(prevUser => ({
                ...prevUser,
                shippingAddress: {
                    ...prevUser.shippingAddress,
                    [fieldName]: value
                }
            }));
        } else {
            setUser(prevUser => ({
                ...prevUser,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        let errors = {};

        if (!user.firstName.trim()) errors.firstName = "Il nome è obbligatorio.";
        else if (user.firstName.trim().length < 2) errors.firstName = "Il nome deve avere almeno 2 caratteri.";
        else if (user.firstName.trim().length > 50) errors.firstName = "Il nome non può superare i 50 caratteri.";

        if (!user.lastName.trim()) errors.lastName = "Il cognome è obbligatorio.";
        else if (user.lastName.trim().length < 2) errors.lastName = "Il cognome deve avere almeno 2 caratteri.";
        else if (user.lastName.trim().length > 50) errors.lastName = "Il cognome non può superare i 50 caratteri.";

        if (!user.email.trim()) errors.email = "L'email è obbligatoria.";
        else if (!validator.isEmail(user.email)) errors.email = "L'email non è valida.";

        if (!isEditMode && !user.password) {
            errors.password = "La password è obbligatoria per un nuovo utente.";
        } else if (user.password && user.password.length < 8) {
            errors.password = "La password deve contenere almeno 8 caratteri.";
        }

        if (!user.role) errors.role = "Il ruolo è obbligatorio.";
        else if (!['user', 'admin'].includes(user.role)) errors.role = "Il ruolo deve essere 'user' o 'admin'.";

        if (user.phone && !validator.isMobilePhone(user.phone, 'any', { strictMode: false })) {
            errors.phone = "Il numero di telefono non è valido.";
        } else if (user.phone && user.phone.length > 20) {
            errors.phone = "Il numero di telefono non può superare i 20 caratteri.";
        }

        if (user.birthDate && new Date(user.birthDate) > new Date()) {
            errors.birthDate = "La data di nascita non può essere nel futuro.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert("Si prega di correggere gli errori nel modulo.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const dataToSend = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone || undefined,
                birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : undefined,
                avatar: user.avatar,
                shippingAddress: (user.shippingAddress.street || user.shippingAddress.city || user.shippingAddress.zipCode || user.shippingAddress.country) ? user.shippingAddress : undefined,
            };

            if (user.password) {
                dataToSend.password = user.password;
            }

            if (isEditMode) {
                await axios.put(`/api/admin/users/${id}`, dataToSend);
                alert("Utente aggiornato con successo!");
            } else {
                await axios.post(`/api/admin/users`, dataToSend)// Adatta l'endpoint
                alert("Utente creato con successo!");
                setUser({ // Resetta il form dopo la creazione
                    firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '', birthDate: '',
                    avatar: { url: 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg', public_id: null },
                    shippingAddress: { street: '', city: '', zipCode: '', country: '' },
                });
                setFormErrors({}); // Resetta gli errori del form
            }
            navigate('/admin/users'); // Reindirizza alla lista dopo il successo
        } catch (err) {
            console.error("Errore nel salvataggio utente:", err);
            const apiErrorMessage = err.response?.data?.message || "Impossibile salvare l'utente.";
            setError(apiErrorMessage);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento dati utente...</span>
                </Spinner>
                <p>Caricamento dati utente per la modifica...</p>
            </Container>
        );
    }

    if (isEditMode && !user.firstName && !error) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Utente non trovato o ID non valido.</Alert>
                <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="me-2" />Torna alla lista utenti
                </Button>
            </div>
            <h1 className="mb-4">{isEditMode ? `Modifica Utente: ${user.firstName} ${user.lastName}` : "Crea Nuovo Utente"}</h1>

            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                    <Card.Body>
                        {isEditMode && (
                            <Row className="mb-3 align-items-center">
                                <Col md={3} className="text-center">
                                    <Image src={user.avatar?.url || 'https://res.cloudinary.com/dztq95r7a/image/upload/v1757890401/no-image_k1reth.jpg'} roundedCircle style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt="Avatar Utente" />
                                    <small className="d-block mt-2 text-muted">Avatar attuale</small>
                                </Col>
                                <Col md={9}></Col>
                            </Row>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formFirstName" className="mb-3">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={user.firstName}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.firstName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formLastName" className="mb-3">
                                    <Form.Label>Cognome</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={user.lastName}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                isInvalid={!!formErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Password {isEditMode && <small className="text-muted">(Lascia vuoto per non modificare)</small>}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder={isEditMode ? "Lascia vuoto per non cambiare la password" : "Inserisci la password"}
                                value={user.password}
                                onChange={handleChange}
                                isInvalid={!!formErrors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formRole" className="mb-3">
                            <Form.Label>Ruolo</Form.Label>
                            <Form.Select
                                name="role"
                                value={user.role}
                                onChange={handleChange}
                                isInvalid={!!formErrors.role}
                            >
                                <option value="user">Utente Standard</option>
                                <option value="admin">Amministratore</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.role}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formPhone" className="mb-3">
                            <Form.Label>Numero di Telefono</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                placeholder="Es. +39 123 4567890"
                                value={user.phone || ''}
                                onChange={handleChange}
                                isInvalid={!!formErrors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formBirthDate" className="mb-3">
                            <Form.Label>Data di Nascita</Form.Label>
                            <Form.Control
                                type="date"
                                name="birthDate"
                                value={user.birthDate || ''}
                                onChange={handleChange}
                                isInvalid={!!formErrors.birthDate}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.birthDate}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <h5 className="mt-4 mb-3">Indirizzo di Spedizione (Opzionale)</h5>
                        <Form.Group controlId="formShippingStreet" className="mb-3">
                            <Form.Label>Via</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress.street"
                                placeholder="Via e numero civico"
                                value={user.shippingAddress?.street || ''}
                                onChange={handleChange}
                                isInvalid={!!formErrors['shippingAddress.street']}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors['shippingAddress.street']}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formShippingCity" className="mb-3">
                                    <Form.Label>Città</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="shippingAddress.city"
                                        placeholder="Città"
                                        value={user.shippingAddress?.city || ''}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors['shippingAddress.city']}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors['shippingAddress.city']}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="formShippingZipCode" className="mb-3">
                                    <Form.Label>CAP</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="shippingAddress.zipCode"
                                        placeholder="CAP"
                                        value={user.shippingAddress?.zipCode || ''}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors['shippingAddress.zipCode']}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors['shippingAddress.zipCode']}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="formShippingCountry" className="mb-3">
                                    <Form.Label>Paese</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="shippingAddress.country"
                                        placeholder="Paese"
                                        value={user.shippingAddress?.country || ''}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors['shippingAddress.country']}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors['shippingAddress.country']}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button variant={isEditMode ? "primary" : "success"} type="submit" className="mt-4" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    {isEditMode ? "Salvataggio..." : "Creazione..."}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Save className="me-2" /> : <PersonPlus className="me-2" />}
                                    {isEditMode ? "Salva Modifiche" : "Crea Utente"}
                                </>
                            )}
                        </Button>
                    </Card.Body>
                </Card>
            </Form>
        </Container>
    );
}

export default AdminUsersFormPage;