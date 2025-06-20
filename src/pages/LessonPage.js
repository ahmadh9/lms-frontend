import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, CircularProgress, Alert, Card, CardContent,
  Button, Paper, Chip
} from '@mui/material';
import { VideoLibrary as VideoIcon, Description as DescriptionIcon } from '@mui/icons-material';
import api from '../services/api';
import progressService from '../services/progressService';

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [nextLessonId, setNextLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        const { lesson, moduleLessons, nextLessonId } = res.data;
        setLesson(lesson);
        setModuleLessons(moduleLessons);
        setNextLessonId(nextLessonId);
        setCompleted(lesson.completed === true);
      } catch (err) {
        console.error(err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const handleMarkAsDone = async () => {
    try {
      await progressService.markLessonAsDone(lessonId);
      setCompleted(true);
    } catch {
      // ignore
    }
  };

  const handleNavigateTo = (id) => {
    if (lesson?.course_id) {
      navigate(`/courses/${lesson.course_id}/lessons/${id}`);
    }
  };

  const handleNext = () => {
    if (nextLessonId && lesson?.course_id) {
      navigate(`/courses/${lesson.course_id}/lessons/${nextLessonId}`);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );
  if (error || !lesson) return (
    <Alert severity="error">{error || 'Lesson not found'}</Alert>
  );

  const { title, content_type, content_url, content_text } = lesson;

  // اضمن استخدام origin الخادم للفيديوهات المحلية
  const videoSrc = content_url
    ? (content_url.startsWith('http')
        ? content_url
        : `http://localhost:5000${content_url}`)
    : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>

        {/* تنقل الدروس الجانبي */}
        <Paper sx={{ width: { xs: '100%', md: 250 }, p: 2, borderRadius: 2, bgcolor: '#f7f9fb' }}>
          <Typography variant="h6" gutterBottom>Module Lessons</Typography>
          {moduleLessons.map(l => (
            <Button
              key={l.id}
              fullWidth
              variant={l.id === lesson.id ? 'contained' : 'text'}
              onClick={() => handleNavigateTo(l.id)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1 }}
            >
              {l.title}
            </Button>
          ))}
        </Paper>

        {/* محتوى الدرس */}
        <Box flex={1}>
          <Card elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {content_type === 'video'
                  ? <VideoIcon color="primary" />
                  : <DescriptionIcon color="action" />}
                <Typography variant="h4" fontWeight={700}>{title}</Typography>
              </Box>

              {/* عرض الفيديو لو موجود المسار */}
              {content_type === 'video' && videoSrc && (
                <Box sx={{ my: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 8px #d4e6fa' }}>
                  <video
                    src={videoSrc}
                    controls
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </Box>
              )}

              {/* عرض النص لو كان content_type text */}
              {content_type === 'text' && (
                <Paper sx={{ p: 3, mt: 2, bgcolor: '#f6f8fa', borderRadius: 3, fontSize: '1.12rem', lineHeight: 2 }}>
                  <Typography component="div" dangerouslySetInnerHTML={{ __html: content_text }} />
                </Paper>
              )}

              {/* أزرار الإكمال والدرس التالي */}
              <Box mt={4} display="flex" alignItems="center" gap={2}>
                {completed
                  ? <Chip label="✓ Completed" color="success" />
                  : <Button variant="contained" color="success" onClick={handleMarkAsDone}>
                      Mark as Done
                    </Button>}
                {nextLessonId && (
                  <Button variant="outlined" onClick={handleNext}>
                    Next Lesson
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default LessonPage;
