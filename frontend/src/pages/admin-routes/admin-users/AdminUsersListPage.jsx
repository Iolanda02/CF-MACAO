import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner, Table } from "react-bootstrap";
import DeleteModal from "../../../components/modals/DeleteModal";
import { Link, useNavigate } from "react-router";
import { getAllUsers, removeUser } from "../../../api/user";
import { EyeFill, PencilFill,  PersonPlus, Search, TrashFill, XCircleFill } from "react-bootstrap-icons";
import "./styles.css";

function AdminUsersListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilterInput, setCurrentFilterInput] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const navigate = useNavigate();

    const [paginator, setPaginator] = useState({
        page: 1,
        perPage: 6,
        totalCount: 0,
        totalPages: 1
    });

    const [paginationItems, setPaginationItems] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, [paginator.page, paginator.perPage, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers(searchTerm, paginator);
            setUsers(response.data);
            setPaginator(prev => ({
                ...prev,
                totalCount: response.totalCount,
                totalPages: response.totalPages
            }));
        } catch (err) {
            console.error("Errore nel recupero utenti:", err);
            setMessage({ type: 'danger', text: 'Impossibile caricare gli utenti. Riprova più tardi.' });
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // Funzione per cambiare la pagina (clic sul numero)
    const handlePageChange = useCallback((number) => {
        if (number !== paginator.page && number <= paginator.totalPages && number >= 1) {
            setPaginator(prev => ({
                ...prev,
                page: number,
            }));
        }
    }, [paginator.page, paginator.totalPages]);

    // Aggiorna gli elementi della paginazione quando i parametri del paginatore cambiano
    useEffect(() => {
        const pages = [];
        for (let number = 1; number <= paginator.totalPages; number++) {
            pages.push(
                <Pagination.Item key={number} active={number === paginator.page}
                    onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        setPaginationItems(pages);
    }, [paginator.totalPages, paginator.page]);

    // Funzione per applicare il filtro (clic sul pulsante Cerca)
    const applyFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
        setSearchTerm(currentFilterInput);
    };
    
    const clearFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
        setSearchTerm("");
        setCurrentFilterInput("");
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await removeUser(userToDelete._id);
            setMessage({ type: 'success', text: 'Utente eliminato con successo!' });
            fetchUsers(); // Ricarica la lista dopo la cancellazione
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Errore nella cancellazione utente:", err);
            setMessage({ type: 'danger', text: 'Errore durante l\'eliminazione del\'utente.' });
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento utenti...</span>
                </Spinner>
                <p>Caricamento utenti...</p>
            </Container>
        );
    }
    
    return (
        <Container className="my-4">
            <Row className="mb-4 align-items-center">
                <Col>
                <h1 className="m-0">Gestione Utenti</h1>
                </Col>
                <Col xs="auto">
                    <Link to="/admin/users/new">
                        <Button variant="outline-dark">
                            <PersonPlus className="me-2" />
                            Aggiungi utente
                        </Button>
                    </Link>
                </Col>
            </Row>

            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                {message.text}
                </Alert>
            )}

            {/* Componente di Ricerca */}
            {(users?.length > 0 || currentFilterInput) && 
                <Row className="mb-4">
                    <Col>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Filtra utenti..."
                                value={currentFilterInput}
                                onChange={(e) => setCurrentFilterInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button variant="outline-secondary" onClick={applyFilter} disabled={loading}>
                                <Search className="me-1" />Cerca
                            </Button>
                            <Button variant="outline-danger" onClick={clearFilter} disabled={loading || !currentFilterInput}>
                                <XCircleFill className="me-1" />Reset
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
            }

            {users?.length === 0 ? (
                <Alert variant="info">Nessun utente trovato.</Alert>
            ) : (
                <Table striped bordered hover responsive className="admin-users-table">
                    <thead>
                        <tr>
                            <th className="text-dark-emphasis">#</th>
                            <th className="text-dark-emphasis">Nome Completo</th>
                            <th className="text-dark-emphasis">Email</th>
                            <th className="text-dark-emphasis">Ruolo</th>
                            <th className="text-dark-emphasis">Data Registrazione</th>
                            <th className="text-dark-emphasis text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{(paginator.page - 1) * paginator.perPage + index + 1}</td>
                                <td>{user.fullName || `${user.firstName} ${user.lastName}`}</td>
                                <td><b>{user.email}</b></td>
                                <td><span className={`badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}`}>{user.role}</span></td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Link to={`/admin/users/${user._id}`}>
                                            <Button variant="outline-dark" size="sm" title="Visualizza utente">
                                                <EyeFill />
                                            </Button>
                                        </Link>
                                        <Link to={`/admin/users/edit/${user._id}`}>
                                            <Button variant="outline-secondary" size="sm" title="Modifica utente">
                                                <PencilFill />
                                            </Button>
                                        </Link>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(user)} title="Elimina utente">
                                            <TrashFill />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Paginazione */}
            {paginator.totalPages > 1 && (
                <Row className="my-3 justify-content-center">
                    <Col xs="auto" className="d-flex align-items-baseline gap-3 flex-wrap">
                        <Pagination>
                            <Pagination.First disabled={paginator.page === 1} onClick={() => handlePageChange(1)} />
                            <Pagination.Prev disabled={paginator.page === 1} onClick={() => handlePageChange(paginator.page - 1)} />

                            {paginationItems}

                            <Pagination.Next disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.page + 1)} />
                            <Pagination.Last disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.totalPages)} />
                        </Pagination>
                        <small className="text-muted">{paginator.totalCount} risultati totali</small>
                    </Col>
                </Row>
            )}

            <DeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteUser}
                textToShow={"Sei sicuro di voler eliminare l'utente " +
                    (userToDelete ? (userToDelete.fullName || `${userToDelete.firstName} ${userToDelete.lastName}`) : '') + "?"
                }
            />
        </Container>
    )
}

export default AdminUsersListPage;