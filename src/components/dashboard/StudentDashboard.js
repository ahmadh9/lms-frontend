// src/components/dashboard/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import enrollmentService from '../../services/enrollmentService';
import api from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchEnrollments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    }
  };

  const fetchEnrollments = async () => {
    try {
      const data = await enrollmentService.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {dashboardData?.enrolledCourses || enrollments.length}
            </Typography>
            <Typography variant="body2">Enrolled Courses</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {dashboardData?.completedCourses || 0}
            </Typography>
            <Typography variant="body2">Completed Courses</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {dashboardData?.averageProgress || 0}%
            </Typography>
            <Typography variant="body2">Average Progress</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'white',
            }}
          >
            <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {enrollments.reduce((sum, e) => sum + (e.assignments?.length || 0), 0)}
            </Typography>
            <Typography variant="body2">Total Assignments</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* My Courses */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        My Courses
      </Typography>
      
      {enrollments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't enrolled in any courses yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Browse Courses
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => (
            <Grid item xs={12} md={6} lg={4} key={enrollment.enrollment_id || enrollment.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {enrollment.course_title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Instructor: {enrollment.instructor_name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{enrollment.progress || 0}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={enrollment.progress || 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {enrollment.completed_at && (
                    <Chip
                      label="Completed"
                      color="success"
                      size="small"
                      icon={<CheckCircleIcon />}
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleContinueCourse(enrollment.course_id)}
                  >
                    Continue Learning
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StudentDashboard;
