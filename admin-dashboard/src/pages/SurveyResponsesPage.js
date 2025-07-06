import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Paper, Chip, Divider
} from '@mui/material';

const SurveyResponsesPage = () => {
  const { surveyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [sentimentGroups, setSentimentGroups] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL || '/admin/api'}/communication/surveys/${surveyId}/responses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSurvey(data.data.survey);
          setResponses(data.data.responses);
          setSentimentGroups(data.data.sentimentGroups || {});
        } else {
          setError(data.message || 'Failed to fetch responses');
        }
      } catch (err) {
        setError('Failed to fetch responses');
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [surveyId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Survey: {survey?.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {survey?.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Responses: {responses.length}
        </Typography>
      </Paper>
      {Object.entries(sentimentGroups).map(([sentiment, group]) => (
        <Box key={sentiment} sx={{ mb: 4 }}>
          <Divider sx={{ mb: 2 }}>
            <Chip label={sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} />
          </Divider>
          {group.length === 0 ? (
            <Typography color="text.secondary">No responses</Typography>
          ) : (
            group.map(resp => (
              <Paper key={resp.id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">{resp.responseText}</Typography>
                {!survey.anonymousOnly && resp.respondent && (
                  <Typography variant="caption" color="text.secondary">
                    — {resp.respondent.fullName} ({resp.respondent.department})
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </Box>
      ))}
    </Container>
  );
};

export default SurveyResponsesPage;
