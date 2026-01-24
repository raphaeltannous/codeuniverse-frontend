import { useQuery, useMutation } from '@tanstack/react-query';
import type { SubscriptionResponse, CheckoutSessionResponse, UpdatePaymentResponse } from '~/types/subscription';
import { apiFetch } from '~/utils/api';

const API_BASE = '/api/subscriptions';

export function useSubscription() {

  // Get subscription status
  const subscriptionQuery = useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Get client secret for embedded checkout
  const clientSecretMutation = useMutation<CheckoutSessionResponse, Error, string>({
    mutationFn: async (priceId: string) => {
      const response = await apiFetch(`${API_BASE}/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create checkout session');
      }

      return response.json();
    },
  });

  // Update payment method
  const updatePaymentMutation = useMutation<UpdatePaymentResponse, Error>({
    mutationFn: async () => {
      const response = await apiFetch(`${API_BASE}/update-payment-method`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update payment method');
      }

      const data = await response.json();
      
      // Redirect to Stripe Billing Portal
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
      
      return data;
    },
  });

  return {
    subscription: subscriptionQuery.data,
    isLoadingSubscription: subscriptionQuery.isLoading,
    isErrorSubscription: subscriptionQuery.isError,
    refetchSubscription: subscriptionQuery.refetch,

    clientSecretMutation,
    updatePaymentMutation,
  };
}
