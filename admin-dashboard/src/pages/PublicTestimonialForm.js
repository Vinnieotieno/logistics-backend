import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Rating, Paper, Checkbox, FormControlLabel, Alert } from '@mui/material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://globeflight.co.ke/api';

const PublicTestimonialForm = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';

  const [form, setForm] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    improvement: '',
    rating: 5,
    email,
    consent: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.consent) {
      setError('You must consent to submit your testimonial.');
      return;
    }
    setLoading(true);
    try {
      // POSTs to /testimonials/public/submit, which saves as isPublished: false
      await axios.post(`${API_BASE}/testimonials/public/submit`, {
        ...form,
        improvement: form.improvement
      });
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Paper sx={{ p: 4, mt: 4, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Thank you for your feedback!</Typography>
        <Typography>Your testimonial has been received and will be reviewed by our team.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, mt: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Submit Your Testimonial</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Please fill in your details and let us know how we can improve our services.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Your Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} required />
        <TextField label="Position" name="position" value={form.position} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Company" name="company" value={form.company} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Testimonial" name="content" value={form.content} onChange={handleChange} fullWidth multiline rows={4} sx={{ mb: 2 }} required />
        <TextField label="What did you like most about our service?" name="likeMost" value={form.likeMost || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Any suggestions for improvement?" name="improvement" value={form.improvement} onChange={handleChange} fullWidth multiline rows={2} sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Rating</Typography>
          <Rating name="rating" value={form.rating} onChange={(_, v) => setForm(f => ({ ...f, rating: v }))} />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.consent}
              onChange={handleChange}
              name="consent"
              color="primary"
            />
          }
          label="I consent to my testimonial and details being used by the company."
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ mt: 2 }}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Paper>
  );
};

export default PublicTestimonialForm;
