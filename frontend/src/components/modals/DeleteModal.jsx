import { Modal, Button } from 'react-bootstrap';

function DeleteModal({ show, onHide, onConfirm, textToShow }) {
    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Conferma Eliminazione</Modal.Title>
            </Modal.Header>
            <Modal.Body> 
                {textToShow} Questa operazione è irreversibile.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Annulla
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Elimina Definitivamente
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteModal;