'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmissionsChart } from '../components/EmissionsChart';
import 'bootstrap/dist/css/bootstrap.min.css';

// Initialize Bootstrap's JavaScript
import { useEffect } from 'react';
const queryClient = new QueryClient();

export default function Home() {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <nav className="navbar bg-light mb-4">
              <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Vessel Emissions Dashboard</span>
              </div>
            </nav>
            <EmissionsChart />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}