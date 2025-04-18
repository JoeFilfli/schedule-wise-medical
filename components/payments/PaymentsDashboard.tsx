// components/payments/PaymentsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { format, parseISO }    from 'date-fns';
import {
  Modal,
  Button,
  Table,
  Card,
  ListGroup,
  Spinner,
  Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Invoice {
  appointmentId: string;
  doctorName:    string;
  date:          string;    // ISO date
  amount?:       number;    // defaults to 30
}

interface Payment {
  id:         string;
  date:       string;       // ISO date
  amount:     number;
  method:     string;
  receiptUrl: string;
}

interface Me {
  firstName: string;
  lastName:  string;
  balance:   number;
}

export default function PaymentsDashboard() {
  const [me,         setMe]         = useState<Me|null>(null);
  const [pending,    setPending]    = useState<Invoice[]>([]);
  const [history,    setHistory]    = useState<Payment[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string|null>(null);

  const [showPay,    setShowPay]    = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice|null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Load user, pending & history
  useEffect(() => {
    (async () => {
      try {
        const [meRes, pRes, hRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/payments/pending'),
          fetch('/api/payments/history'),
        ]);
        if (!meRes.ok) throw new Error((await meRes.json()).error || 'Failed to load user');
        if (!pRes.ok)  throw new Error((await pRes.json()).error || 'Failed to load pending');
        if (!hRes.ok)  throw new Error((await hRes.json()).error || 'Failed to load history');

        setMe(await meRes.json());
        setPending(await pRes.json());
        setHistory(await hRes.json());
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // open pay‑modal
  const onPayNow = (inv: Invoice) => {
    setPayInvoice(inv);
    setShowPay(true);
  };

  // confirm payment
  const confirmPay = async () => {
    if (!payInvoice) return;
    setPayLoading(true);

    try {
      const res = await fetch('/api/payments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: payInvoice.appointmentId,
          method:        'BALANCE'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      // reload
      setShowPay(false);
      setPayInvoice(null);
      setLoading(true);

      const [meRes, pRes, hRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/payments/pending'),
        fetch('/api/payments/history'),
      ]);
      setMe(await meRes.json());
      setPending(await pRes.json());
      setHistory(await hRes.json());
    } catch (err: any) {
      alert(err.message || 'Payment error');
    } finally {
      setPayLoading(false);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error)   return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="mb-4">Payments &amp; Invoices</h2>

      {/* Balance */}
      <Card className="mb-4">
        <Card.Body>
          <h5>Your Balance</h5>
          <h2>${me!.balance.toFixed(2)}</h2>
        </Card.Body>
      </Card>

      {/* Pending */}
      <Card className="mb-4">
        <Card.Header><strong>Pending Invoices</strong></Card.Header>
        <ListGroup variant="flush">
          {/* fallback item with key */}
          {pending.length === 0 && (
            <ListGroup.Item key="no-pending">
              No pending invoices.
            </ListGroup.Item>
          )}
          {/* each invoice has its own key */}
          {pending.map(inv => {
            const amt = inv.amount ?? 30;
            const disabled = me!.balance < amt;
            return (
              <ListGroup.Item
                key={inv.appointmentId}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Dr. {inv.doctorName}</strong><br/>
                  {format(parseISO(inv.date), 'PPpp')}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span>${amt.toFixed(2)}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onPayNow(inv)}
                  >
                    {disabled ? 'Insufficient' : 'Pay Now'}
                  </Button>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card>

      {/* History */}
      <Card className="mb-4">
        <Card.Header><strong>Payment History</strong></Card.Header>
        <Table striped hover responsive className="mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {/* fallback row with key */}
            {history.length === 0 ? (
              <tr key="no-history">
                <td colSpan={4} className="text-center">
                  No payments yet.
                </td>
              </tr>
            ) : (
              history.map(p => (
                <tr key={p.id}>
                  <td>{format(parseISO(p.date), 'PPpp')}</td>
                  <td>${p.amount.toFixed(2)}</td>
                  <td>{p.method}</td>
                  <td>
                    {p.receiptUrl
                      ? <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      : '—'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Pay Modal */}
      <Modal show={showPay} onHide={() => setShowPay(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Dr. {payInvoice?.doctorName}</strong><br/>
            {payInvoice && format(parseISO(payInvoice.date), 'PPpp')}
          </p>
          <p><strong>Amount:</strong> ${(payInvoice?.amount ?? 30).toFixed(2)}</p>
          <p><strong>Your Balance:</strong> ${me!.balance.toFixed(2)}</p>
          <hr/>
          <p><strong>Balance After:</strong>{' '}
            ${(me!.balance - (payInvoice?.amount ?? 30)).toFixed(2)}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPay(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirmPay}
            disabled={payLoading}
          >
            {payLoading 
              ? <Spinner as="span" animation="border" size="sm" /> 
              : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
