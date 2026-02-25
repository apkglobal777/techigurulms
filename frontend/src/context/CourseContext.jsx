/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]); // For instructors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch All Public Courses (With Pagination, Search & Filters)
    const fetchCourses = async (keyword = '', pageNumber = '', category = '', level = '') => {
        setLoading(true);
        try {
            // Updated to support Category and Level filters from Backend
            const { data } = await api.get(`/courses?keyword=${keyword}&pageNumber=${pageNumber}&category=${category}&level=${level}`);
            setCourses(data.courses);
            return data; // Returns { courses, page, pages, total }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Single Course
    const fetchCourseById = async (id) => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // 3. Fetch Instructor Courses (My Courses)
    const fetchMyCourses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/courses/mycourses');
            setMyCourses(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch your courses');
        } finally {
            setLoading(false);
        }
    };

    // 4. Upload Course Asset (Thumbnail or Resources)
    // Aligns with POST /api/courses/upload
    const uploadCourseAsset = async (file) => {
        const formData = new FormData();
        formData.append('image', file); // Field name 'image' matches Multer config

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await api.post('/courses/upload', formData, config);
            return { success: true, url: data.url };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Upload failed' };
        }
    };

    // 5. Create Course
    const createCourse = async (courseData) => {
        try {
            // courseData contains title, description... AND the nested 'sections' array
            const { data } = await api.post('/courses', courseData);
            
            // Optimistically add to local list
            setMyCourses(prev => [data, ...prev]); 
            return { success: true, data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Creation failed' };
        }
    };

    // 6. Update Course
    const updateCourse = async (id, courseData) => {
        try {
            // courseData includes full 'sections' structure with Resources, Code, Quizzes
            const { data } = await api.put(`/courses/${id}`, courseData);
            
            // Update in local state maps to reflect changes immediately
            setCourses(prev => prev.map(c => c._id === id || c.id === id ? data : c));
            setMyCourses(prev => prev.map(c => c._id === id || c.id === id ? data : c));
            
            return { success: true, data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Update failed' };
        }
    };

    // 7. Delete Course
    const deleteCourse = async (id) => {
        try {
            await api.delete(`/courses/${id}`);
            // Remove from local state
            setCourses(prev => prev.filter(c => c._id !== id && c.id !== id));
            setMyCourses(prev => prev.filter(c => c._id !== id && c.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Delete failed' };
        }
    };

    return (
        <CourseContext.Provider value={{ 
            courses, 
            myCourses, 
            loading, 
            error, 
            fetchCourses, 
            fetchCourseById, 
            fetchMyCourses,
            uploadCourseAsset, // New function exposed to context
            createCourse, 
            updateCourse, 
            deleteCourse 
        }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => useContext(CourseContext);