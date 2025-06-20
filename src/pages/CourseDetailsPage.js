import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, CircularProgress, Alert,
  Tabs, Tab, Card, CardContent, Chip, Stack, Button, Grid
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import api from '../services/api';
import quizService from '../services/quizService';

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (location.state?.updatedQuiz) {
      const { lessonId, score } = location.state.updatedQuiz;
      setQuizzes(prev =>
        prev.map(q =>
          q.lesson_id === lessonId ? { ...q, score } : q
        )
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, location.pathname]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { course: c } = await courseService.getCourseById(courseId);
      setCourse(c);

      if (user?.role === 'student') {
        const enrolled = await enrollmentService.checkEnrollment(courseId);
        setIsEnrolled(enrolled);

        if (enrolled) {
          setLessons((c.modules || []).flatMap(m => m.lessons || []));

          // Load assignments + submissions
          const aRes = await api.get(`/assignments/course/${courseId}`);
          const assignmentsWithSubmissions = await Promise.all(
            (aRes.data.assignments || []).map(async a => {
              try {
                const subRes = await api.get(`/assignments/lesson/${a.lesson_id}`);
                return {
                  ...a,
                  submission: subRes.data.submission || null,
                };
              } catch (err) {
                return { ...a, submission: null };
              }
            })
          );
          setAssignments(assignmentsWithSubmissions);

          const qRes = await quizService.getCourseQuizzes(courseId);
          setQuizzes(qRes || []);
        }
      }

      setLoading(false);
    };
    load();
  }, [courseId, user]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!course) return <Alert severity="error">Course not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: '#f9f9fb' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
          {course.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
      </Paper>

      {isEnrolled ? (
        <>
          <Tabs
            value={tabIndex}
            onChange={(_, i) => setTabIndex(i)}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: '#fff',
              boxShadow: '0 1px 8px 0 #eee'
            }}
            variant="fullWidth"
          >
            <Tab label={`Lessons (${lessons.length})`} />
            <Tab label={`Assignments (${assignments.length})`} />
            <Tab label={`Quizzes (${quizzes.length})`} />
          </Tabs>

          {/* LESSONS */}
          {tabIndex === 0 && (
            <Grid container spacing={3}>
              {lessons.map(les => (
                <Grid item xs={12} sm={6} md={4} key={les.id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#fafbfc',
                      transition: '0.2s',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6, bgcolor: '#f1f5ff' }
                    }}
                    onClick={() => navigate(`/courses/${courseId}/lessons/${les.id}`)}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        {{
                          video: <VideoIcon color="primary" />,
                          quiz: <QuizIcon color="secondary" />,
                          text: <DescriptionIcon color="action" />
                        }[les.content_type] || <DescriptionIcon color="disabled" />}
                        <Typography variant="h6" fontWeight={600}>
                          {les.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {les.content_type === 'video' ? 'Video Lesson'
                          : les.content_type === 'text' ? 'Text Lesson'
                          : 'Lesson'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {lessons.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ p: 2 }}>No lessons yet.</Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* ASSIGNMENTS */}
          {tabIndex === 1 && (
            <Grid container spacing={3}>
              {assignments.length > 0 ? assignments.map(a => (
                <Grid item xs={12} sm={6} md={4} key={a.assignment_id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#fff8f2',
                      transition: '0.2s',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6, bgcolor: '#fef6e7' }
                    }}
                    onClick={() => navigate(`/courses/${courseId}/lesson/${a.lesson_id}/assignment`)}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <AssignmentIcon color="warning" />
                        <Typography variant="h6" fontWeight={600}>{a.assignment_title}</Typography>
                      </Stack>

                      {a.submission ? (
                        a.submission.grade != null ? (
                          <Chip
                            label={`Submitted – Graded: ${a.submission.grade}`}
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        ) : (
                          <Chip
                            label="Submitted – Not graded yet"
                            color="warning"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )
                      ) : (
                        <Chip
                          label="Not submitted"
                          color="default"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Typography sx={{ p: 2 }} color="text.secondary">No assignments yet.</Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* QUIZZES */}
          {tabIndex === 2 && (
            <Grid container spacing={3}>
              {quizzes.length > 0 ? quizzes.map(q => (
                <Grid item xs={12} sm={6} md={4} key={q.lesson_id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#f3f9f6',
                      transition: '0.2s',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6, bgcolor: '#e7f8f0' }
                    }}
                    onClick={() => navigate(`/courses/${courseId}/lesson/${q.lesson_id}/quiz`)}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <QuizIcon color="success" />
                        <Typography variant="h6" fontWeight={600}>
                          {q.lesson_title}
                        </Typography>
                      </Stack>
                      <Chip
                        label={q.score != null ? `Completed: ${q.score}%` : 'Not taken yet'}
                        color={q.score != null ? "success" : "default"}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Typography sx={{ p: 2 }} color="text.secondary">No quizzes yet.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </>
      ) : (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Enroll to access all lessons and assignments!</Typography>
          <Button variant="contained" size="large" onClick={() => navigate(`/courses/${courseId}`)}>
            Enroll Now
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CourseDetailsPage;
