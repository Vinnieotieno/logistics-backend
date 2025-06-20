// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Blogs from './pages/Blogs';
import NewsletterSubscribers from './pages/NewsletterSubscribers';
import Tracking from './pages/Tracking';
import Contacts from './pages/Contacts';
import Jobs from './pages/Jobs';
import Users from './pages/Users';
import Testimonials from './pages/Testimonials';
import PublicTestimonialForm from './pages/PublicTestimonialForm';
import TeamSection from './pages/TeamSection';
import CommunicationDepartment from './pages/CommunicationDepartment';
import SurveyResponsesPage from './pages/SurveyResponsesPage'; // <-- Add this import (create the file if it doesn't exist)

// Update the theme with additional colors for team and communication features
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
    // Additional colors for new features
    team: {
      main: '#86c517',
      light: '#b8e034',
      dark: '#68a80d',
    },
    communication: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="services/*" element={<Services />} />
                <Route path="blogs/*" element={<Blogs />} />
                <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
                <Route path="tracking/*" element={<Tracking />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="jobs/*" element={<Jobs />} />
                <Route path="users" element={<Users />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="team" element={<TeamSection />} />
                <Route path="communication" element={<CommunicationDepartment />} />
                <Route path="surveys/:surveyId/responses" element={<SurveyResponsesPage />} /> {/* <-- Add this line */}
              </Route>
              <Route path="/testimonial/submit" element={<PublicTestimonialForm />} />
            </Routes>
          </Router>
        </AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#4caf50',
              },
            },
            error: {
              style: {
                background: '#f44336',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;