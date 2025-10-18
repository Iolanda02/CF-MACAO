import { Card } from "react-bootstrap";
import { Form } from "react-router";

// Componente per gestire l'indirizzo di spedizione
const AddressForm = ({ address, onChange, readOnly = false }) => {
    const handleAddressChange = (e) => {
        onChange({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Card className="p-3 mb-3">
            <Card.Title>Indirizzo di Spedizione</Card.Title>
            <Form.Group className="mb-3">
                <Form.Label>Via</Form.Label>
                <Form.Control 
                    type="text" 
                    name="street" 
                    value={address?.street || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Città</Form.Label>
                <Form.Control 
                    type="text" 
                    name="city" 
                    value={address?.city || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>CAP</Form.Label>
                <Form.Control 
                    type="text" 
                    name="zipCode" 
                    value={address?.zipCode || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Provincia</Form.Label>
                <Form.Control 
                    type="text" 
                    name="province" 
                    value={address?.province || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Nazione</Form.Label>
                <Form.Control 
                    type="text" 
                    name="country" 
                    value={address?.country || ''} 
                    onChange={handleAddressChange} 
                    readOnly={readOnly} 
                />
            </Form.Group>
        </Card>
    );
};

export default AddressForm;