// src/components/courses/CourseCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/courses/${course.id}`);
  };

  // Default thumbnail if none provided
  const thumbnailUrl = course.thumbnail 
    ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${course.thumbnail}`
    : 'https://via.placeholder.com/300x200?text=Course';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={thumbnailUrl}
        alt={course.title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {course.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {course.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {course.instructor_name}
          </Typography>
        </Box>
        
        {course.category_name && (
          <Chip
            label={course.category_name}
            size="small"
            color="primary"
            variant="outlined"
            icon={<SchoolIcon />}
          />
        )}
        
        {course.students_count !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {course.students_count} students enrolled
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleViewCourse}
        >
          View Course
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;