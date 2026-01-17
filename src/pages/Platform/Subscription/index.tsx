import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import { useSubscription } from '~/hooks/useSubscription';
import { useNotification } from '~/hooks/useNotification';
import { useState } from 'react';
import { EmbeddedCheckoutForm } from '~/components/EmbeddedCheckoutForm';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  features: string[];
  highlighted?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Basic problem set access',
      'Up to 10 problem submissions',
      'Community support',
      'Limited course access',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Full access and everything you need',
    monthlyPrice: 29,
    yearlyPrice: 150,
    monthlyPriceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY || '',
    yearlyPriceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY || '',
    features: [
      'Access to all problems',
      'All course access',
      'Priority support',
      'Private Discord community',
      'Interview preparation',
    ],
    highlighted: true,
  },
];

export default function SubscriptionPage() {
  const {
    subscription,
    isLoadingSubscription,
    isErrorSubscription,
    clientSecretMutation,
    updatePaymentMutation,
  } = useSubscription();
  console.log(PRICING_PLANS)
  const notification = useNotification();
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      notification.info('You are already on the Free plan');
      return;
    }

    const priceId = billingCycle === 'yearly' ? plan.yearlyPriceId : plan.monthlyPriceId;
    
    if (!priceId) {
      notification.error('Price not configured');
      return;
    }

    setSelectedPlan(plan);
    clientSecretMutation.mutate(priceId, {
      onSuccess: (response) => {
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
          setShowCheckout(true);
          notification.success('Opening checkout...');
        } else {
          notification.error('Failed to create checkout session');
        }
      },
      onError: (error: Error) => {
        notification.error(error.message);
        setSelectedPlan(null);
      },
    });
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setClientSecret(null);
    setSelectedPlan(null);
    notification.success('Subscription completed successfully!');
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setClientSecret(null);
    setSelectedPlan(null);
  };

  const handleUpdatePayment = () => {
    updatePaymentMutation.mutate(undefined, {
      onSuccess: (response) => {
        notification.success(response.message || 'Redirecting to payment portal...');
        // Redirect handled in mutation
      },
      onError: (error: Error) => {
        notification.error(error.message);
      },
    });
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="mb-3 fw-bold">Upgrade Your Learning</h1>
            <p className="text-muted fs-5">
              Choose the perfect plan to unlock your potential
            </p>
          </div>

          {isLoadingSubscription && (
            <div className="text-center mb-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading your subscription...</span>
            </div>
          )}

          {isErrorSubscription && (
            <div className="text-center mb-4">
              <span className="text-warning">Unable to load subscription details. Please try again later.</span>
            </div>
          )}

          {subscription && (
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-3">
                Current Plan: <span className={`text-${subscription.status === 'premium' ? 'success' : 'warning'}`}>
                  {subscription.status === 'premium' ? 'Premium' : 'Free'}
                </span>
              </h3>
              {subscription.status !== 'free' && (
                <Button
                  variant="primary"
                  onClick={handleUpdatePayment}
                  disabled={updatePaymentMutation.isPending}
                >
                  {updatePaymentMutation.isPending ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Subscription'
                  )}
                </Button>
              )}
            </div>
          )}
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        {PRICING_PLANS.map((plan) => (
          <Col md={6} lg={6} key={plan.id} className={plan.id === 'premium' ? 'mx-auto' : ''}>
            <Card
              className={`h-100 ${
                plan.highlighted ? 'border-primary border-2' : ''
              }`}
              style={{ position: 'relative' }}
            >
              {plan.highlighted && (
                <Badge
                  bg="primary"
                  className="position-absolute top-0 start-50 translate-middle"
                  style={{ zIndex: 1 }}
                >
                  Most Popular
                </Badge>
              )}

              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-4 fw-bold mb-2">
                  {plan.name}
                </Card.Title>
                <p className="text-muted small mb-3">{plan.description}</p>

                <div className="mb-4">
                  <span className="fs-2 fw-bold">
                    ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.id === 'premium' && (
                    <>
                      <span className="text-muted">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                      <div className="mt-3 btn-group w-100" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="billing"
                          id="monthly"
                          value="monthly"
                          checked={billingCycle === 'monthly'}
                          onChange={() => setBillingCycle('monthly')}
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="monthly"
                        >
                          Monthly
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="billing"
                          id="yearly"
                          value="yearly"
                          checked={billingCycle === 'yearly'}
                          onChange={() => setBillingCycle('yearly')}
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="yearly"
                        >
                          Yearly (Save 57%)
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <ul className="list-unstyled mb-4 flex-grow-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-start">
                      <Check
                        size={18}
                        className="text-success me-2 flex-shrink-0 mt-1"
                      />
                      <span className="small">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? 'primary' : 'outline-primary'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={
                    subscription?.status === plan.id ||
                    (selectedPlan?.id === plan.id &&
                    clientSecretMutation.isPending)
                  }
                  className="w-100"
                >
                  {selectedPlan?.id === plan.id &&
                  clientSecretMutation.isPending ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : subscription?.status === plan.id ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Current Plan'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Body>
              <h5 className="fw-bold mb-3">Frequently Asked Questions</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p className="small fw-bold mb-2">Can I upgrade or downgrade?</p>
                  <p className="small text-muted">
                    Yes, you can change plans anytime. Changes take effect on your next billing date.
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="small fw-bold mb-2">Do you offer refunds?</p>
                  <p className="small text-muted">
                    We offer a 7-day money-back guarantee if you're not satisfied.
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="small fw-bold mb-2">Is my payment secure?</p>
                  <p className="small text-muted">
                    All payments are processed securely through Stripe.
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="small fw-bold mb-2">Can I cancel anytime?</p>
                  <p className="small text-muted">
                    Yes, you can cancel your subscription immediately without penalties.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCheckout} onHide={handleCheckoutCancel} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Complete Your {selectedPlan?.name} Subscription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clientSecret && (
            <EmbeddedCheckoutForm
              clientSecret={clientSecret}
              onSuccess={handleCheckoutComplete}
              onCancel={handleCheckoutCancel}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
