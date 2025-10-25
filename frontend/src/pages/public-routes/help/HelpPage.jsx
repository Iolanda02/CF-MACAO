import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import { TelephoneFill, ChevronDown, QuestionCircleFill } from 'react-bootstrap-icons';
import faqsData from '../../../data/faqs.js';
import { useRef } from 'react';
import "./styles.css";

function HelpPage() {
    const faqSectionRef = useRef(null);

    const scrollToFaqs = () => {
        faqSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Container className="my-5">
        {/* Sezione Contatti */}
        <Row className="justify-content-center align-items-center mb-5">
            <Col md={6} lg={5} className='h-full'>
            <Card className="shadow-sm border-0 help-card bg-secondary text-white h-100"> 
                <Card.Body className="d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <Card.Title className="h4 mb-0 fw-bold">Possiamo aiutarti?</Card.Title>
                        <span onClick={scrollToFaqs} style={{ cursor: 'pointer' }}>
                            <ChevronDown size={20} />
                        </span>
                    </div>
                    <Card.Text className="text-white-50" onClick={scrollToFaqs} style={{ cursor: 'pointer' }}>
                    Leggi le domande più frequenti
                    </Card.Text>
                </Card.Body>
            </Card>
            </Col>

            <Col md={6} lg={5} className='h-full'>
            <Card className="shadow-sm border-0 help-card contact bg-secondary h-100">
                <Card.Body>
                <Card.Text className="text-muted mb-1">Chiama il numero di assistenza</Card.Text>
                <div className="d-flex align-items-center mb-2">
                    <TelephoneFill className="me-2 text-primary-emphasis" size={24} />
                    <Card.Title className="h3 mb-0 fw-bold text-primary-emphasis">800 124535</Card.Title>
                </div>
                <Card.Text className="text-muted small">
                    Dal lunedì al sabato dalle 8:00 alle 20:00
                </Card.Text>
                </Card.Body>
            </Card>
            </Col>
        </Row>

        {/* Sezione Domande Frequenti */}
        <Row className="justify-content-center faq-section-offset" ref={faqSectionRef}>
            <Col md={10} lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Domande frequenti</h2>
                {/* <Button variant="link" className="text-uppercase text-decoration-none fw-bold">
                Visualizza tutto
                </Button> */}
            </div>

            <Accordion defaultActiveKey="0" className="faq-accordion"> 
                {faqsData.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={faq.id} className="mb-2 border rounded">
                    <Accordion.Header className="bg-light">
                    <span className="fw-semibold">{faq.question}</span>
                    </Accordion.Header>
                    <Accordion.Body className="text-muted">
                    {faq.answer}
                    </Accordion.Body>
                </Accordion.Item>
                ))}
            </Accordion>
            </Col>
        </Row>
        </Container>
    )
}

export default HelpPage;