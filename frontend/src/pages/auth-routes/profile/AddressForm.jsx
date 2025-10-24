import { Col, Form, Row } from "react-bootstrap";

// Componente per gestire l'indirizzo di spedizione
const AddressForm = ({ address, onChange, readOnly = false }) => {
    const handleAddressChange = (e) => {
        onChange({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="my-3">
            <h5>Indirizzo di Spedizione</h5>
            <Form.Group className="mb-3">
                <Form.Label>Indirizzo</Form.Label>
                <Form.Control 
                    type="text" 
                    name="address" 
                    placeholder="Via e numero civico"
                    value={address?.address || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Città</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="city" 
                            placeholder="Città"
                            value={address?.city || ''} 
                            onChange={handleAddressChange} 
                            readOnly={readOnly} 
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>CAP</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="postalCode" 
                            placeholder="CAP"
                            value={address?.postalCode || ''} 
                            onChange={handleAddressChange} 
                            readOnly={readOnly} 
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Paese</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="country" 
                            placeholder="Paese"
                            value={address?.country || ''} 
                            onChange={handleAddressChange} 
                            readOnly={readOnly} 
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default AddressForm;