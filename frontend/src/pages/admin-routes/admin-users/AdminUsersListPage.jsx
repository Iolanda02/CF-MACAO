import { useState } from "react";
import { Pagination } from "react-bootstrap";
import DeleteModal from "../../../components/modals/DeleteModal";

function AdminUsersListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
        setError(null);
        try {
            const response = await axios.get(`/api/admin/users`, {
                params: {
                    page: page,
                    limit: usersPerPage,
                    search: searchTerm
                }
            });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error("Errore nel recupero utenti:", err);
            setError("Impossibile caricare gli utenti. Riprova più tardi.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

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

    // Funzione per cambiare la pagina (clic sul numero)
    const handlePageChange = useCallback((number) => {
        if (number !== paginator.page && number <= paginator.totalPages && number >= 1) {
            setPaginator(prev => ({
                ...prev,
                page: number,
            }));
        }
    }, [paginator.page, paginator.totalPages]);

    // Funzione per applicare il filtro (clic sul pulsante Cerca)
    const applyFilter = () => {
        setPaginator(prev => ({
            ...prev,
            page: 1
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset della pagina quando si cerca
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await axios.delete(`/api/admin/users/${userToDelete._id}`);
            fetchUsers(); // Ricarica la lista dopo la cancellazione
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Errore nella cancellazione utente:", err);
            setError("Impossibile cancellare l'utente.");
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

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    return (
        <Container className="mt-4">
            <h1 className="mb-4">Gestione Utenti</h1>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <InputGroup className="w-50">
                    <InputGroup.Text><Search /></InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Cerca per nome, cognome o email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </InputGroup>
                <LinkContainer to="/admin/users/new">
                    <Button variant="success">
                        <PersonPlus className="me-2" />
                        Nuovo Utente
                    </Button>
                </LinkContainer>
            </div>

            {users.length === 0 ? (
                <Alert variant="info">Nessun utente trovato.</Alert>
            ) : (
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nome Completo</th>
                            <th>Email</th>
                            <th>Ruolo</th>
                            <th>Data Registrazione</th>
                            <th className="text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{(page - 1) * usersPerPage + index + 1}</td>
                                <td>{user.fullName || `${user.firstName} ${user.lastName}`}</td>
                                <td>{user.email}</td>
                                <td><span className={`badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}`}>{user.role}</span></td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="text-center">
                                    <LinkContainer to={`/admin/users/${user._id}`}>
                                        <Button variant="primary" size="sm" className="me-2" title="Visualizza Dettagli">
                                            <Eye />
                                        </Button>
                                    </LinkContainer>
                                    <LinkContainer to={`/admin/users/${user._id}`}>
                                        <Button variant="info" size="sm" className="me-2" title="Modifica">
                                            <PencilSquare />
                                        </Button>
                                    </LinkContainer>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)} title="Elimina">
                                        <Trash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Paginazione */}
            {paginator.totalPages > 1 && (
                <Row className="mt-5 justify-content-center">
                    <Col xs="auto">
                        <Pagination>
                            <Pagination.First disabled={paginator.page === 1} onClick={() => handlePageChange(1)} />
                            <Pagination.Prev disabled={paginator.page === 1} onClick={() => handlePageChange(paginator.page - 1)} />

                            {paginationItems}

                            <Pagination.Next disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.page + 1)} />
                            <Pagination.Last disabled={paginator.page === paginator.totalPages} onClick={() => handlePageChange(paginator.totalPages)} />
                        </Pagination>
                    </Col>
                </Row>
            )}

            <DeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteUser}
                textToShow={"Sei sicuro di voler eliminare l'utente " +
                    userToDelete ? '**' + (userToDelete.fullName || `${userToDelete.firstName} ${userToDelete.lastName}`) + '**' : '' + "?"
                }
            />
        </Container>
    )
}

export default AdminUsersListPage;