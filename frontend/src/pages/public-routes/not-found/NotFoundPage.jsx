
import { Link } from "react-router";

function NotFoundPage() {
    const notFoundImage = '';

    return (
        <div className="not-found-page-root d-flex align-items-center justify-content-center min-vh-100 py-5">
            <Container className="text-center">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        {/* Immagine o Icona Grande */}
                        {notFoundImage ? (
                            <Image src={notFoundImage} alt="Pagina non trovata" fluid className="mb-4" style={{ maxWidth: '400px' }} />
                        ) : (
                            <h1 className="display-1 text-danger mb-4">
                                <span className="d-block">404</span>
                                <span className="d-block">Pagina Non Trovata</span>
                            </h1>
                        )}

                        {/* Messaggio Principale */}
                        {!notFoundImage && <h1 className="display-4 mb-3">Oops!</h1>}
                        <p className="lead mb-4">
                            Siamo spiacenti, la pagina che stavi cercando non è stata trovata.
                            <br></br>
                            Potrebbe essere stata rimossa, il nome è cambiato o non è mai esistita.
                        </p>

                        {/* Pulsanti di Navigazione */}
                        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                            <Button 
                                as={Link}
                                to="/" 
                                variant="primary" 
                                size="lg" 
                                className="me-sm-3 mb-2 mb-sm-0"
                            >
                                <HouseDoorFill className="me-2" /> Torna alla Homepage
                            </Button>
                        </div>

                        {/*
                        <p className="mt-4">Se credi che ci sia un errore, <Link to="/contact">contattaci</Link>.</p>
                        */}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default NotFoundPage;