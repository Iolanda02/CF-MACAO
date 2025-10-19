import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";

// Funzione per inizializzare lo stato del prodotto vuoto
const getInitialProductState = () => ({
  name: '',
  slug: '',
  brand: '',
  description: '',
  itemType: 'coffee_capsule',
  isActive: true,
  tags: [],
  // Campi specifici per coffee_capsule
  intensity: '',
  roastLevel: 'Medium',
  blend: '',
  aromaProfile: '',
  systemCompatibility: [],
  variants: []
});

// Funzione per inizializzare una variante vuota
const getInitialVariantState = () => ({
  name: '',
  sku: '',
  price: { amount: 0, currency: 'EUR' },
  discountPrice: 0,
  stock: { quantity: 0 },
  images: [{ url: '', altText: '', isMain: true }],
  weight: { value: 0, unit: 'g' },
  color: '',
  size: ''
});

function AdminProductsFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditing = !!id;

    const [product, setProduct] = useState(getInitialProductState());
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    
    useEffect(() => {
        if (isEditing) {
            getProductDetails(id);
        } else {
            setProduct(getInitialProductState());
        }
    }, [id, isEditing, getProductDetails]);

        
    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(false);
            const foundProduct = await fetchProductDetails(id);
            setProduct({
              ...foundProduct,
              intensity: foundProduct.intensity ? foundProduct.intensity.toString() : '',
              tags: foundProduct.tags ? foundProduct.tags.join(', ') : '',
              systemCompatibility: foundProduct.systemCompatibility ? foundProduct.systemCompatibility.join(', ') : '',
              variants: foundProduct.variants || []
            });
        } catch(error) {
            setError(true);
            console.error(error);
            navigate('/404', { replace: true });
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Gestore per i campi del prodotto principale
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Aggiunge una nuova variante vuota all'array
    const addVariant = () => {
        setProduct(prev => ({
            ...prev,
            variants: [...prev.variants, getInitialVariantState()]
        }));
    };

    // Rimuove una variante dall'array dato il suo indice
    const removeVariant = (indexToRemove) => {
        setProduct(prev => ({
            ...prev,
            variants: prev.variants.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Gestisce il cambiamento dei campi di una specifica variante
    const handleVariantChange = (index, field, value) => {
        setProduct(prev => {
            const newVariants = [...prev.variants];
            // Gestione dei campi annidati come price.amount o stock.quantity
            if (field.includes('.')) {
                const [parentField, subField] = field.split('.');
                newVariants[index] = {
                    ...newVariants[index],
                    [parentField]: {
                        ...newVariants[index][parentField],
                        [subField]: value
                    }
                };
            } else if (field === 'images') {
                newVariants[index] = {
                    ...newVariants[index],
                    images: [{ url: value, altText: newVariants[index].images[0]?.altText || '', isMain: true }]
                };
            }
            else {
                newVariants[index] = {
                    ...newVariants[index],
                    [field]: value
                };
            }
            return { ...prev, variants: newVariants };
        });
    };
    
    // Funzione per la validazione delle varianti
    const validateVariants = () => {
        if (product.variants.length === 0) {
            setError('Devi aggiungere almeno una variante per il prodotto.');
            return false;
        }

        for (let i = 0; i < product.variants.length; i++) {
            const variant = product.variants[i];
            if (!variant.name.trim()) {
                setError(`Il nome della variante ${i + 1} è obbligatorio.`);
                return false;
            }
            if (variant.price.amount <= 0) {
                setError(`Il prezzo della variante ${i + 1} deve essere maggiore di zero.`);
                return false;
            }
            if (variant.stock.quantity < 0) {
                setError(`La quantità in stock della variante ${i + 1} non può essere negativa.`);
                return false;
            }
        }
        return true;
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!product.name || !product.itemType) {
        setError('Nome e tipo di prodotto sono campi obbligatori.');
        return;
        }
        if (product.intensity && (isNaN(parseInt(product.intensity)) || parseInt(product.intensity) < 1 || parseInt(product.intensity) > 12)) {
            setError('L\'intensità deve essere un numero intero tra 1 e 12.');
            return;
        }
        // Validazione delle varianti
        if (!validateVariants()) {
            return;
        }

        // ... Altre validazioni

        setSubmitting(true);

        // Prepara i dati per l'invio (converti stringhe in numeri/array se necessario)
        const dataToSend = {
            ...product,
            intensity: product.intensity ? parseInt(product.intensity) : undefined,
            tags: product.tags ? product.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            systemCompatibility: product.systemCompatibility ? product.systemCompatibility.split(',').map(sys => sys.trim()).filter(sys => sys) : [],
            variants: product.variants.map(variant => ({
                ...variant,
                // Assicurati che price.amount e stock.quantity siano numeri
                price: { ...variant.price, amount: parseFloat(variant.price.amount) },
                discountPrice: parseFloat(variant.discountPrice),
                stock: { ...variant.stock, quantity: parseInt(variant.stock.quantity) },
                weight: { ...variant.weight, value: parseFloat(variant.weight.value) }
            }))
        };

        try {
            if (isEditing) {
                // Chiamata API PUT/PATCH per aggiornare il prodotto
                // const response = await api.put(`/items/${id}`, dataToSend);
                // console.log('Prodotto modificato:', response.data);
                console.log('Modifica prodotto (simulato):', dataToSend);
                setMessage('Prodotto modificato con successo!');
            } else {
                // Chiamata API POST per aggiungere il prodotto
                // const response = await api.post('/items', dataToSend);
                // console.log('Prodotto aggiunto:', response.data);
                console.log('Aggiungi prodotto (simulato):', { ...dataToSend }); 
                setMessage('Prodotto aggiunto con successo!');
            }

            // Reindirizza alla lista dei prodotti
            setTimeout(() => navigate('/admin/products'));

        } catch (err) {
            setError(`Errore durante ${isEditing ? 'la modifica' : 'l\'aggiunta'} del prodotto.`);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) 
        return <Container className="my-4"><h3>Caricamento prodotto...</h3></Container>;
    if (isEditing && !product) 
        return <Container className="my-4"><Alert variant="info">Prodotto non disponibile per la modifica.</Alert></Container>;

    return (
        <Container className="my-4">
        <Row>
            <Col>
            <h2>{isEditing ? `Modifica Prodotto: ${product?.name}` : 'Aggiungi Nuovo Prodotto'}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group className="mb-3" controlId="productName">
                <Form.Label>Nome Prodotto</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Nome del prodotto"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="productBrand">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Nome del brand"
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                    disabled={submitting}
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="productDescription">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Descrizione dettagliata del prodotto..."
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    disabled={submitting}
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="productItemType">
                    <Form.Label>Tipo di Prodotto</Form.Label>
                    <Form.Select
                        name="itemType"
                        value={product.itemType}
                        onChange={handleChange}
                        required
                        disabled={isEditing || submitting}
                    >
                        <option value="coffee_capsule">Capsula di Caffè</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="productIsActive">
                    <Form.Check
                        type="checkbox"
                        label="Prodotto Attivo"
                        name="isActive"
                        checked={product.isActive}
                        onChange={handleChange}
                        disabled={submitting}
                    />
                </Form.Group>

                {/* <Form.Group className="mb-3" controlId="productTags">
                    <Form.Label>Tags (separati da virgola)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Es. intenso, arabica, biologico"
                        name="tags"
                        value={product.tags} 
                        onChange={handleChange}
                        disabled={submitting}
                    />
                </Form.Group> */}

                {product.itemType === 'coffee_capsule' && (
                <>
                    <h3>Dettagli Capsula di Caffè</h3>
                    <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="coffeeIntensity">
                        <Form.Label>Intensità (1-12)</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Es. 8"
                            name="intensity"
                            value={product.intensity}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="coffeeRoastLevel">
                        <Form.Label>Livello di Tostatura</Form.Label>
                        <Form.Select
                            name="roastLevel"
                            value={product.roastLevel}
                            onChange={handleChange}
                            disabled={submitting}
                        >
                            <option value="Light">Light</option>
                            <option value="Medium">Medium</option>
                            <option value="Dark">Dark</option>
                            <option value="Extra Dark">Extra Dark</option>
                        </Form.Select>
                        </Form.Group>
                    </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="coffeeBlend">
                    <Form.Label>Miscela</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Es. 70% Arabica, 30% Robusta"
                        name="blend"
                        value={product.blend}
                        onChange={handleChange}
                        disabled={submitting}
                    />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="coffeeAromaProfile">
                    <Form.Label>Profilo Aromatico</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Es. Note di cioccolato fondente e caramello"
                        name="aromaProfile"
                        value={product.aromaProfile}
                        onChange={handleChange}
                        disabled={submitting}
                    />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="coffeeSystemCompatibility">
                        <Form.Label>Sistemi Compatibili (separati da virgola)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Es. Nespresso, Dolce Gusto, Lavazza A Modo Mio"
                            name="systemCompatibility"
                            value={product.systemCompatibility}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                    </Form.Group>
                </>
                )}

                {/* Gestione delle Varianti (complessità significativa) */}
                <h3 className="mt-4">Varianti Prodotto</h3>
                {product.variants.length === 0 && (
                    <Alert variant="info" className="text-center">
                        Nessuna variante aggiunta. Clicca "Aggiungi Nuova Variante" per iniziare.
                    </Alert>
                )}

                {product.variants.map((variant, index) => (
                    <div key={variant._id || `new-variant-${index}`} className="border p-3 mb-3 rounded shadow-sm">
                        <Row className="align-items-center mb-3">
                            <Col>
                                <h4>Variante {index + 1}</h4>
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeVariant(index)}
                                    disabled={submitting}
                                    aria-label={`Rimuovi variante ${index + 1}`}
                                >
                                    <Trash /> Rimuovi
                                </Button>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId={`variantName-${index}`}>
                            <Form.Label>Nome Variante</Form.Label>
                            <Form.Control
                                type="text"
                                value={variant.name}
                                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantSku-${index}`}>
                                    <Form.Label>SKU</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                        disabled={submitting}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantPrice-${index}`}>
                                    <Form.Label>Prezzo (€)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>€</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={variant.price.amount}
                                            onChange={(e) => handleVariantChange(index, 'price.amount', e.target.value)}
                                            required
                                            disabled={submitting}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantDiscountPrice-${index}`}>
                                    <Form.Label>Prezzo Scontato (€)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>€</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={variant.discountPrice}
                                            onChange={(e) => handleVariantChange(index, 'discountPrice', e.target.value)}
                                            disabled={submitting}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantStock-${index}`}>
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={variant.stock.quantity}
                                        onChange={(e) => handleVariantChange(index, 'stock.quantity', e.target.value)}
                                        required
                                        disabled={submitting}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId={`variantImage-${index}`}>
                            <Form.Label>Immagine Principale (URL)</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="URL dell'immagine principale"
                                value={variant.images[0]?.url || ''}
                                onChange={(e) => handleVariantChange(index, 'images', e.target.value)}
                                disabled={submitting}
                            />
                        </Form.Group>
                        {/* Potresti aggiungere un campo per altText o per aggiungere più immagini */}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantWeightValue-${index}`}>
                                    <Form.Label>Peso</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={variant.weight.value}
                                            onChange={(e) => handleVariantChange(index, 'weight.value', e.target.value)}
                                            disabled={submitting}
                                        />
                                        <Form.Select
                                            value={variant.weight.unit}
                                            onChange={(e) => handleVariantChange(index, 'weight.unit', e.target.value)}
                                            disabled={submitting}
                                        >
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                            <option value="ml">ml</option>
                                            <option value="l">l</option>
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantColor-${index}`}>
                                    <Form.Label>Colore</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Es. Rosso, Nero"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                        disabled={submitting}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId={`variantSize-${index}`}>
                            <Form.Label>Dimensione</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Es. Small, Medium, Large"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                disabled={submitting}
                            />
                        </Form.Group>
                    </div>
                ))}

                <Button
                    variant="outline-secondary"
                    onClick={addVariant}
                    className="mt-3 mb-4 d-flex align-items-center"
                    disabled={submitting}
                >
                    <PlusCircle className="me-2" /> Aggiungi Nuova Variante
                </Button>

                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={submitting}>
                    {submitting ? (isEditing ? 'Salvataggio...' : 'Aggiunta...') : (isEditing ? 'Salva Modifiche' : 'Aggiungi Prodotto')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/admin/products')} className="w-100 mt-2" disabled={submitting}>
                    Annulla
                </Button>
            </Form>
            </Col>
        </Row>
        </Container>
    )
}

export default AdminProductsFormPage;