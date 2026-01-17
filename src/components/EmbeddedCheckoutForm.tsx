import { useEffect, useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Alert, Spinner } from 'react-bootstrap';

interface EmbeddedCheckoutFormProps {
  clientSecret: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

export function EmbeddedCheckoutForm({
  clientSecret,
  onSuccess,
  onCancel,
}: EmbeddedCheckoutFormProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (clientSecret) {
      setIsReady(true);
    }
  }, [clientSecret]);

  if (!isReady) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout onComplete={onSuccess} />
    </EmbeddedCheckoutProvider>
  );
}
