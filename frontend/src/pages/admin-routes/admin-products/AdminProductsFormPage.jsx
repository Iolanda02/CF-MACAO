import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Image, InputGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { addImages, createProduct, getProduct, removeImage, updateImage, updateProduct } from "../../../api/product";
import { ArrowLeft, PersonPlus, PlusCircle, Save, Trash, XCircleFill } from "react-bootstrap-icons";
import { useToast } from "../../../contexts/ToastContext";
import "./styles.css";

// Funzione per inizializzare lo stato del prodotto vuoto
const getInitialProductState = () => ({
  name: '',
  slug: '' ,
  brand: '',
  description: '',
  itemType: 'coffee_capsule',
  isActive: true,
  tags: '',
  // Campi specifici per coffee_capsule
  intensity: 0,
  roastLevel: 'Medium',
  blend: '',
  aromaProfile: '',
  systemCompatibility: '',
  variants: []
});

// Funzione per inizializzare una variante vuota
const getInitialVariantState = () => ({
  name: '',
  sku: '',
  price: { amount: 0, currency: 'EUR' },
  discountPrice: 0,
  stock: { quantity: 0 },
  images: [], //{ url: '', altText: '', isMain: true }
  weight: { value: 0, unit: 'g' },
  color: '',
  size: ''
});

function AdminProductsFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(getInitialProductState());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [formErrors, setFormErrors] = useState({variants: []});
    const { addToast } = useToast();
    // imagesToUpload: { [variantIndex]: { [imageIndex]: { file: File, previewUrl: string, isNew: boolean, isDeleted: boolean } } }
    const [imagesToProcess, setImagesToProcess] = useState({});
    
    const isEditing = !!id;

    const getProductDetails = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const foundProduct = await getProduct(id);
            setProduct({
              ...foundProduct.data,
            //   intensity: foundProduct.intensity ? foundProduct.intensity.toString() : '',
            //   tags: foundProduct.tags ? foundProduct.tags.join(', ') : '',
            //   systemCompatibility: foundProduct.systemCompatibility ? foundProduct.systemCompatibility.join(', ') : '',
            //   variants: foundProduct.variants || []
            });

            // Inizializza imagesToProcess con le immagini esistenti per la preview
            const initialImagesToProcess = {};
            foundProduct.data.variants.forEach((variant, vIdx) => {
                initialImagesToProcess[vIdx] = {};
                variant.images.forEach((img, iIdx) => {
                    initialImagesToProcess[vIdx][iIdx] = {
                        file: null, // Nessun file, è un'immagine esistente
                        previewUrl: img.url,
                        altText: img.altText,
                        isMain: img.isMain,
                        isNew: false, // Non è una nuova immagine da caricare
                        isDeleted: false, // Non è marcata per la cancellazione
                        _id: img._id // ID dell'immagine esistente
                    };
                });
            });
            setImagesToProcess(initialImagesToProcess);

        } catch(error) {
            console.error(error);
            setError("Impossibile caricare i dettagli del prodotto. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isEditing) {
            getProductDetails(id);
        } else {
            setProduct(getInitialProductState());
            setImagesToProcess({});
            setLoading(false);
            setError(null);
            setFormErrors({});
        }
    }, [id, isEditing, getProductDetails]);
    
    // Gestore per i campi del prodotto principale
    const handleChange = (e) => {
        // e.preventDefault();
        const { name, value, type, checked } = e.target;
        setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));

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
        setImagesToProcess(prev => ({
            ...prev,
            [prev.variants?.length || 0]: {}
        }));
    };

    // Rimuove una variante dall'array dato il suo indice
    const removeVariant = (indexToRemove) => {
        setProduct(prev => ({
            ...prev,
            variants: prev.variants.filter((_, index) => index !== indexToRemove)
        }));
        // Rimuove anche le immagini associate a questa variante
        setImagesToProcess(prev => {
            const newImagesToProcess = { ...prev };
            // delete newImagesToProcess[indexToRemove];
            newImagesToProcess.splice(indexToRemove, 1);
            return newImagesToProcess;
        });
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
            } 
            // else if (field === 'images') {
            //     newVariants[index] = {
            //         ...newVariants[index],
            //         images: [{ url: value, altText: newVariants[index].images[0]?.altText || '', isMain: true }]
            //     };
            // }
            else {
                newVariants[index] = {
                    ...newVariants[index],
                    [field]: value
                };
            }
            return { ...prev, variants: newVariants };
        });
    };
        
    // --- Gestione delle Immagini ---

    // Aggiunge un nuovo campo file input per un'immagine
    const addImageField = (variantIndex) => {
        setImagesToProcess(prev => {
            const newVariantImages = { ...prev[variantIndex] };
            const nextImageIndex = Object.keys(newVariantImages).length;
            newVariantImages[nextImageIndex] = {
                file: null,
                previewUrl: null,
                altText: '',
                isMain: nextImageIndex === 0, // La prima immagine aggiunta è di default main
                isNew: true,
                isDeleted: false
            };
            return { ...prev, [variantIndex]: newVariantImages };
        });
    };

    const handleImageFileChange = (variantIndex, imageIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagesToProcess(prev => ({
                    ...prev,
                    [variantIndex]: {
                        ...prev[variantIndex],
                        [imageIndex]: {
                            ...prev[variantIndex][imageIndex],
                            file: file,
                            previewUrl: reader.result,
                            isNew: true,
                            isDeleted: false
                        }
                    }
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // Se l'utente cancella la selezione del file
            setImagesToProcess(prev => ({
                ...prev,
                [variantIndex]: {
                    ...prev[variantIndex],
                    [imageIndex]: {
                        ...prev[variantIndex][imageIndex],
                        file: null,
                        previewUrl: prev[variantIndex][imageIndex].isNew ? null : product.variants[variantIndex]?.images[imageIndex]?.url,
                        isNew: prev[variantIndex][imageIndex].isNew ? false : prev[variantIndex][imageIndex].isNew,
                        isDeleted: prev[variantIndex][imageIndex]._id ? true : false
                    }
                }
            }));
        }
    };

    const handleImageAltTextChange = (variantIndex, imageIndex, value) => {
        setImagesToProcess(prev => ({
            ...prev,
            [variantIndex]: {
                ...prev[variantIndex],
                [imageIndex]: {
                    ...prev[variantIndex][imageIndex],
                    altText: value
                }
            }
        }));
    };

    const handleImageMainChange = (variantIndex, imageIndex, isChecked) => {
        setImagesToProcess(prev => {
            const newVariantImages = { ...prev[variantIndex] };
            // Imposta tutte le altre isMain a false per questa variante
            for (const imgIdx in newVariantImages) {
                newVariantImages[imgIdx].isMain = false;
            }
            // Imposta quella selezionata a true
            newVariantImages[imageIndex].isMain = isChecked;
            return { ...prev, [variantIndex]: newVariantImages };
        });
    };

    const handleRemoveImage = (variantIndex, imageIndex) => {
        setImagesToProcess(prev => {
            const newVariantImages = { ...prev[variantIndex] };
            if (newVariantImages[imageIndex]._id) {
                // Se ha un ID, marca come eliminata per l'API
                newVariantImages[imageIndex].isDeleted = true;
            } else {
                // Se è una nuova immagine non ancora caricata, rimuovila del tutto dallo stato
                delete newVariantImages[imageIndex];
            }

            // Rimuovi l'immagine dal product.variants
            setProduct(currentProduct => {
                const newProduct = { ...currentProduct };
                const variant = { ...newProduct.variants[variantIndex] };
                variant.images = variant.images.filter((_, idx) => idx !== imageIndex);
                newProduct.variants[variantIndex] = variant;
                return newProduct;
            });
            return { ...prev, [variantIndex]: newVariantImages };
        });
    };
    
    // Funzione per la validazione delle varianti
    const validateVariants = () => {
        let variants = [];

        if (product.variants.length === 0) {
            variants.push('Devi aggiungere almeno una variante per il prodotto.');
        }

        for (let i = 0; i < product.variants.length; i++) {
            const variant = product.variants[i];
            if (!variant.name.trim()) {
                variants.push(`Il nome della variante ${i + 1} è obbligatorio.`);
            }
            if (variant.price.amount <= 0) {
                variants.push(`Il prezzo della variante ${i + 1} deve essere maggiore di zero.`);
            }
            if (variant.stock.quantity < 0) {
                variant.push(`La quantità in stock della variante ${i + 1} non può essere negativa.`);
            }
        }
        setFormErrors(prev => ({...prev, variants: variants}));
        return variants.length === 0;
    };

    // Funzione per la validazione delle varianti
    const validateProduct = () => {
        let errors = {};

        if (!product.name.trim()) {
            errors.name = 'Il nome del prodotto è obbligatorio.'
        }
        if (!product.itemType.trim()) {
            errors.itemType = 'Il tipo di prodotto è obbligatorio.'
        }
        if (product.intensity && (isNaN(parseInt(product.intensity)) || parseInt(product.intensity) < 1 || parseInt(product.intensity) > 12)) {
            errors.intensity = 'L\'intensità deve essere un numero intero tra 1 e 12.';
        }
        
        setFormErrors(prev => ({...prev, ...errors}));
        return Object.keys(errors).length === 0;
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const productValidation = validateProduct();
        const variantValidation = validateVariants();
        if (!productValidation || !variantValidation) {
            // setMessage({ type: 'danger', text: 'Si prega di correggere gli errori nella pagina.' });
            return;
        }
        
        setSubmitting(true);
        setError(null);

        let savedProduct;
        // Prepara i dati per l'invio
        const dataToSend = {
            ...product,
            intensity: product.intensity ? parseInt(product.intensity) : 0,
            // tags: product.tags ? product.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            // systemCompatibility: product.systemCompatibility ? product.systemCompatibility.map(sys => sys.trim()).filter(sys => sys) : [],
            variants: product.variants.map(variant => ({
                ...variant,
                itemType: product.itemType,
                price: { ...variant.price, amount: variant.price?.amount? parseFloat(variant.price.amount): 0 },
                discountPrice: variant.discountPrice? parseFloat(variant.discountPrice): 0,
                stock: { ...variant.stock, quantity: variant.stock?.quantity? parseInt(variant.stock.quantity): 0 },
                weight: { ...variant.weight, value: variant.weight?.value? parseFloat(variant.weight.value): 0 }
            }))
        };

        try {
            if (isEditing) {
                savedProduct = await updateProduct(id, dataToSend);
                savedProduct = savedProduct.data;
                addToast("Prodotto modificato con successo!", "success");
            } else {
                savedProduct = await createProduct({...dataToSend});
                savedProduct = savedProduct.data;
                addToast("Prodotto aggiunto con successo!", "success");
            }
        } catch (err) {
            console.error("Errore nel salvataggio prodotto:", err);
            const apiErrorMessage = err.response?.data?.message || "Impossibile salvare il prodotto.";
            setMessage("Impossibile salvare il prodotto. Riprova più tardi.");
            addToast("Salvataggio non riuscito", "danger");
            return;
        } finally {
            setSubmitting(false);
        }

        try {
            const currentProductId = savedProduct._id;

            // Gestione immagini per ogni variante
            const finalVariants = await Promise.all(
                savedProduct.variants.map(async (variant, vIdx) => {
                    const currentVariantId = variant?._id || savedProduct.variants[vIdx]?._id; // Ottieni l'ID della variante salvata
                    const variantImagesToProcess = imagesToProcess[vIdx] || {};
                    const newVariantImagesArray = []; // Questo array conterrà le immagini finali per la variante

                    // console.log("variantImagesToProcess ", variantImagesToProcess)

                    // Processa eliminazioni
                    for (const imgIdx in variantImagesToProcess) {
                        const imgData = variantImagesToProcess[imgIdx];
                        if (imgData.isDeleted && imgData._id) {
                            await removeImage(currentProductId, currentVariantId, imgData._id);
                        }
                    }

                    // Processa caricamenti e aggiornamenti metadati
                    for (const imgIdx in variantImagesToProcess) {
                        const imgData = variantImagesToProcess[imgIdx];
                        if (!imgData.isDeleted) { // Solo se l'immagine non è stata marcata per l'eliminazione
                            if (imgData.file) { // Nuova immagine o immagine cambiata
                                const formDataForImage = new FormData();
                                formDataForImage.append('image', imgData.file);
                                formDataForImage.append('altText', imgData.altText || '');
                                formDataForImage.append('isMain', imgData.isMain); // Multer gestirà "true"/"false" come stringhe

                                const uploadedImageResult = await addImages(currentProductId, currentVariantId, formDataForImage);
                                newVariantImagesArray.push(uploadedImageResult.data);
                            } else if (imgData._id) { // Immagine esistente, potenzialmente con metadati aggiornati
                                // Verifica se i metadati sono cambiati (altText o isMain)
                                const originalImage = (variant.images || []).find(img => img._id === imgData._id);
                                if (originalImage && (originalImage.altText !== imgData.altText || originalImage.isMain !== imgData.isMain)) {
                                    const updatedImageData = await updateImage(
                                        currentProductId,
                                        currentVariantId,
                                        imgData._id,
                                        { altText: imgData.altText, isMain: imgData.isMain }
                                    );
                                    newVariantImagesArray.push(updatedImageData.data);
                                } else if (originalImage) {
                                    // Se non ci sono state modifiche al file o ai metadati, riaggiungi l'immagine originale
                                    newVariantImagesArray.push(originalImage);
                                }
                            }
                        }
                    }

                    return {
                        ...variant,
                        _id: currentVariantId, // L'ID della variante
                        images: newVariantImagesArray // Le immagini finali per questa variante
                    };
                })
            );

            const finalProduct = await getProduct(currentProductId);
            setProduct(finalProduct.data);

            // Reindirizza alla lista dei prodotti
            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            // const apiErrorMessage = err.response?.data?.message || "Impossibile salvare il prodotto.";
            addToast("Problemi con il salvataggio delle immagini.", "danger");
            // vado ugualmente alla lista dei prodotti
            navigate('/admin/products');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento dati prodotto...</span>
                </Spinner>
                <p>Caricamento dati prodotto...</p>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/products")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!product) {
        return ( 
            <Container className="my-5">
                <Button variant="link" onClick={() => navigate("/admin/products")} className="text-dark mb-3">
                    <ArrowLeft className="me-2" />Torna alla lista
                </Button>
                <Alert variant="info">Prodotto non disponibile.</Alert>
            </Container>
        )
    }

    return (
        <Container className="my-4">
            <Button variant="link" onClick={() => navigate('/admin/products')} className="text-dark mb-3">
                <ArrowLeft className="me-2" />Torna alla Lista Prodotti
            </Button>
            <h1 className="mb-4">{isEditing ? `Modifica Prodotto: ${product?.name}` : 'Aggiungi Nuovo Prodotto'}</h1>

            <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="productName">
                    <Form.Label>Nome Prodotto*</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome del prodotto"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        isInvalid={!!formErrors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formErrors.name}
                    </Form.Control.Feedback>
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
                    <Form.Label>Tipo di Prodotto*</Form.Label>
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
                            placeholder="Es. 8"
                            name="intensity"
                            value={product.intensity}
                            onChange={handleChange}
                            onWheel={(e) => e.currentTarget.blur()}
                            disabled={submitting}
                            isInvalid={!!formErrors.intensity}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.intensity}
                        </Form.Control.Feedback>
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

                {/* Gestione delle Varianti */}
                <h3 className="mt-4">Varianti Prodotto</h3>
                {product.variants.length === 0 && (
                    <Alert variant="info" className="text-center">
                        Nessuna variante aggiunta. Clicca "Aggiungi Nuova Variante" per iniziare.
                    </Alert>
                )}

                {product.variants.map((variant, index) => (
                    <div key={index} className="border p-3 mb-3 rounded shadow-sm">
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
                            <Form.Label>Nome Variante*</Form.Label>
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
                                    <Form.Label>Prezzo (€)*</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>€</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={variant.price.amount}
                                            onChange={(e) => handleVariantChange(index, 'price.amount', e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
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
                                            onWheel={(e) => e.currentTarget.blur()}
                                            disabled={submitting}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId={`variantStock-${index}`}>
                                    <Form.Label>Stock*</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={variant.stock.quantity}
                                        onChange={(e) => handleVariantChange(index, 'stock.quantity', e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        required
                                        disabled={submitting}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <h5 className="mt-4 mb-0">Immagini Variante</h5>
                        {Object.keys(imagesToProcess[index] || {}).length === 0 && (
                            <Alert variant="secondary">Nessuna immagine aggiunta per questa variante.</Alert>
                        )}
                        <Row>
                            {Object.entries(imagesToProcess[index] || {}).map(([imgIdx, imgData]) => (
                                (!imgData.isDeleted) && ( // Mostra solo le immagini non marcate per la cancellazione
                                    <Col md={6} lg={4} key={imgIdx} className="my-3">
                                        <div className="position-relative border p-2 rounded section-image">
                                            <div className="container-image">
                                                {imgData.previewUrl ? (
                                                    <Image src={imgData.previewUrl} fluid thumbnail />
                                                ) : (
                                                    <div className="text-center text-muted py-5">No Preview</div>
                                                )}
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0"
                                                    onClick={() => handleRemoveImage(index, imgIdx)}
                                                    disabled={submitting}
                                                >
                                                    <XCircleFill />
                                                </Button>
                                            </div>
                                            <Form.Group className="mt-2">
                                                <Form.Label>File Immagine</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageFileChange(index, imgIdx, e)}
                                                    disabled={submitting}
                                                />
                                                <Form.Label className="mt-2">Alt Text</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Descrizione immagine"
                                                    value={imgData.altText}
                                                    onChange={(e) => handleImageAltTextChange(index, imgIdx, e.target.value)}
                                                    disabled={submitting}
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Immagine Principale"
                                                    checked={imgData.isMain}
                                                    onChange={(e) => handleImageMainChange(index, imgIdx, e.target.checked)}
                                                    className="mt-2"
                                                    disabled={submitting}
                                                />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                )
                            ))}
                        </Row>
                        <div className="mb-4">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => addImageField(index)}
                                className="d-flex align-items-center"
                                disabled={submitting}
                            >
                                <PlusCircle className="me-2" /> Aggiungi Immagine
                            </Button>
                        </div>

                        {/* <Form.Group className="mb-3" controlId={`variantImage-${index}`}>
                            <Form.Label>Immagine Principale (URL)</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="URL dell'immagine principale"
                                value={variant.images[0]?.url || ''}
                                onChange={(e) => handleVariantChange(index, 'images', e.target.value)}
                                disabled={submitting}
                            />
                        </Form.Group> */}
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
                                            onWheel={(e) => e.currentTarget.blur()}
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
                
                {message?.text && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                    {message.text}
                    </Alert>
                )}

                {Object.keys(formErrors).filter(key => key !== 'variants').length > 0 && (
                    Object.keys(formErrors)
                        .filter(key => key !== 'variants')
                        .map((key, index) => (
                            <p key={index} className="text-danger small mb-1">
                                {formErrors[key]}
                            </p>
                        ))
                )}

                {formErrors?.variants?.length > 0 && (
                    formErrors.variants.map((err, index) => (
                        <p key={index} className="text-danger small mb-1">{err}</p>
                    ))
                )}

                <div className="d-flex flex-items-center gap-3 mt-3 mb-5">
                    <Button variant={isEditing ? "secondary" : "success"} type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                {isEditing ? "Salvataggio..." : "Creazione..."}
                            </>
                        ) : (
                            <>
                                {isEditing ? <Save className="me-2" /> : <PersonPlus className="me-2" />}
                                {isEditing ? "Salva Modifiche" : "Crea Prodotto"}
                            </>
                        )}
                    </Button>
                    
                    <Button variant={isEditing ? "outline-secondary" : "outline-success"}
                        disabled={submitting} 
                        onClick={() => navigate(-1)}
                    >
                        Annulla
                    </Button>
                </div>
            </Form>
        </Container>
    )
}

export default AdminProductsFormPage;