import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const DEMO_STORAGE_KEY = '@khadamat_requests_demo_v1';
const REAL_STORAGE_KEY = '@khadamat_requests_real_v1';

const INITIAL_REQUESTS = [
  {
    id: 'req_1',
    title: 'تسريح وتصليح حنفية المطبخ (Fuite sous évier)',
    category: 'plumbing',
    governorate: 'Ariana',
    city: 'Ariana Ville',
    description: 'تسرب ماء قوي تحت حنفية الكوجينة، نحتاج صنايعي بلومبيي اليوم قبل العشية.',
    urgency: 'today',
    budget: '40',
    status: 'open', // 'open' | 'in_progress' | 'completed'
    clientName: 'أنيس الشابي (Anis Chabi)',
    clientPhone: '+21624556677',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'req_2',
    title: 'تصليح مكيف سامسونغ ما يبردش (Clim Samsung)',
    category: 'hvac',
    governorate: 'Tunis',
    city: 'El Menzah 6',
    description: 'المكيف يخدم بالباهي كفونتيلاتور لكن ما يخرجش برودة، نتصور ناقص غاز فريون.',
    urgency: 'immediate',
    budget: '60',
    status: 'open',
    clientName: 'مريم التونسي (Mariem)',
    clientPhone: '+21698778899',
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: 'req_3',
    title: 'تركيب ثريا ليد وتبديل قواطع كهرباء (Électricité)',
    category: 'electrical',
    governorate: 'Ben Arous',
    city: 'Mégrine',
    description: 'تركيب 2 ثريات في الصالون وتبديل 3 ديجانكتور في طابلو الكهرباء.',
    urgency: 'week',
    budget: '45',
    status: 'open',
    clientName: 'طارق بوعزيز (Tarek)',
    clientPhone: '+21655667788',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

const RequestContext = createContext({
  requests: [],
  isLoading: true,
  createRequest: async () => {},
  acceptRequest: async () => {},
  completeRequest: async () => {},
  cancelRequest: async () => {},
  reviewRequest: async () => {},
  addOffer: async () => {},
  acceptOffer: async () => {},
  getRequestsByClient: () => [],
  getRequestsForProvider: () => [],
});

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const requestsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const isDemo = !!user?.isDemo;
  const storageKey = isDemo ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // Load the dataset for the current mode (demo: seeded samples, real: starts empty)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const loadRequests = async () => {
      let data = [];
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          data = JSON.parse(stored);
        } else if (isDemo) {
          data = INITIAL_REQUESTS;
          await AsyncStorage.setItem(storageKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error loading requests from AsyncStorage:', error);
        data = isDemo ? INITIAL_REQUESTS : [];
      }
      if (cancelled) return;
      requestsRef.current = data;
      setRequests(data);
      setIsLoading(false);
    };
    loadRequests();
    return () => {
      cancelled = true;
    };
  }, [storageKey, isDemo]);

  // Save changes
  // Always computes from the latest list (ref), so rapid updates never overwrite each other
  const persistRequests = async (compute) => {
    const updatedRequests =
      typeof compute === 'function' ? compute(requestsRef.current) : compute;
    requestsRef.current = updatedRequests;
    setRequests(updatedRequests);
    try {
      await AsyncStorage.setItem(storageKeyRef.current, JSON.stringify(updatedRequests));
    } catch (error) {
      console.error('Error saving requests to AsyncStorage:', error);
    }
  };

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  const createRequest = async (requestData) => {
    const newRequest = {
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      ...requestData,
    };
    await persistRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const reviewRequest = async (requestId, rating, comment = '') => {
    await persistRequests((prev) =>
      prev.map((req) =>
        req.id === requestId && req.status === 'completed'
          ? { ...req, review: { rating, comment, createdAt: new Date().toISOString() } }
          : req
      )
    );
  };

  // Provider submits (or updates) a price quote on an open request
  const addOffer = async (requestId, provider, price) => {
    const providerId = provider?.uid || 'provider_local';
    const offer = {
      id: `offer_${Date.now()}`,
      providerId,
      name: provider?.profile?.fullName || 'صنايعي محترف',
      phone: provider?.phoneNumber || '',
      governorate: provider?.profile?.governorate || 'Tunisie',
      price: String(price),
      createdAt: new Date().toISOString(),
    };
    await persistRequests((prev) =>
      prev.map((req) =>
        req.id === requestId && req.status === 'open'
          ? {
              ...req,
              offers: [...(req.offers || []).filter((o) => o.providerId !== providerId), offer],
            }
          : req
      )
    );
  };

  // Client picks an offer: assigns that provider and sets the agreed price
  const acceptOffer = async (requestId, offerId) => {
    await persistRequests((prev) =>
      prev.map((req) => {
        const offer = req.id === requestId && (req.offers || []).find((o) => o.id === offerId);
        if (!offer) return req;
        return {
          ...req,
          status: 'in_progress',
          budget: offer.price,
          assignedProvider: {
            id: offer.providerId,
            name: offer.name,
            phone: offer.phone,
            governorate: offer.governorate,
          },
          acceptedAt: new Date().toISOString(),
        };
      })
    );
  };

  const acceptRequest = async (requestId, provider) => {
    await persistRequests((prev) => prev.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'in_progress',
          assignedProvider: {
            id: provider?.uid || 'provider_local',
            name: provider?.profile?.fullName || 'صنايعي محترف',
            phone: provider?.phoneNumber || '+21698000000',
            governorate: provider?.profile?.governorate || 'Tunisie',
          },
          acceptedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const completeRequest = async (requestId) => {
    await persistRequests((prev) => prev.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const cancelRequest = async (requestId) => {
    await persistRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const getRequestsByClient = (clientPhone) => {
    if (!clientPhone) return [];
    return requests.filter((r) => r.clientPhone === clientPhone);
  };

  // Open requests for the provider; sorted so matching category/governorate come first
  const getRequestsForProvider = (providerCategories, providerGov) => {
    const cats = Array.isArray(providerCategories)
      ? providerCategories
      : providerCategories
      ? [providerCategories]
      : [];
    const score = (r) =>
      (cats.includes(r.category) ? 2 : 0) + (providerGov && r.governorate === providerGov ? 1 : 0);
    return requests
      .filter((r) => r.status === 'open')
      .sort((a, b) => score(b) - score(a));
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        isLoading,
        createRequest,
        acceptRequest,
        completeRequest,
        cancelRequest,
        reviewRequest,
        addOffer,
        acceptOffer,
        getRequestsByClient,
        getRequestsForProvider,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => useContext(RequestContext);
