import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiAward, FiHeart, FiTarget, FiEye, FiBookOpen, FiTrendingUp, FiClock } from 'react-icons/fi';
import './About.css';

const About = () => {
  const stats = [
    { icon: <FiBook />, value: '10,000+', label: 'Books in Collection' },
    { icon: <FiUsers />, value: '5,000+', label: 'Active Members' },
    { icon: <FiAward />, value: '15+', label: 'Years of Service' },
    { icon: <FiBookOpen />, value: '50,000+', label: 'Books Borrowed' }
  ];

  const values = [
    {
      icon: <FiHeart />,
      title: 'Passion for Reading',
      description: 'We believe in the transformative power of reading and its ability to change lives.'
    },
    {
      icon: <FiTarget />,
      title: 'Community Focus',
      description: 'Building a vibrant community of readers and lifelong learners.'
    },
    {
      icon: <FiEye />,
      title: 'Innovation',
      description: 'Embracing technology to make library services accessible to everyone.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Excellence',
      description: 'Striving for the highest standards in service and collection quality.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Head Librarian',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      bio: 'PhD in Library Science with 20 years of experience in digital libraries.'
    },
    {
      name: 'Prof. Michael Chen',
      role: 'Technical Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      bio: 'Leading our digital transformation and online catalog systems.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      bio: 'Connecting readers with books and organizing community events.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Our Library</h1>
          <p className="about-hero-subtitle">
            A world of knowledge at your fingertips - where every page turns into a new adventure
          </p>
          <div className="about-hero-buttons">
            <Link to="/member/books/browse" className="about-btn about-btn-primary">
              Browse Collection
            </Link>
            <Link to="/contact" className="about-btn about-btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
        <div className="about-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop" 
            alt="Library Interior"
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-mission-content">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-mission-text">
            To inspire curiosity, foster learning, and build community through free and equitable access to information, ideas, and technology. We are dedicated to providing a welcoming space where everyone can explore, discover, and grow.
          </p>
          <div className="about-mission-stats">
            {stats.map((stat, index) => (
              <div key={index} className="about-stat-item">
                <div className="about-stat-icon">{stat.icon}</div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{stat.value}</span>
                  <span className="about-stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="about-story-grid">
          <div className="about-story-image">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&h=600&fit=crop" 
              alt="Library History"
            />
          </div>
          <div className="about-story-content">
            <h2 className="about-section-title">Our Story</h2>
            <p className="about-story-text">
              Founded in 2008, our library began as a small community reading room with just 500 books. 
              Today, we've grown into a modern digital library serving thousands of members with over 
              10,000 physical books and an extensive digital collection.
            </p>
            <p className="about-story-text">
              Over the years, we've embraced technology to make our services more accessible. From our 
              online catalog to digital borrowing, we're committed to meeting the needs of modern readers 
              while preserving the charm of traditional library experience.
            </p>
            <div className="about-timeline">
              <div className="about-timeline-item">
                <FiClock className="about-timeline-icon" />
                <div>
                  <h4>2008</h4>
                  <p>Library founded with 500 books</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <FiClock className="about-timeline-icon" />
                <div>
                  <h4>2015</h4>
                  <p>Digital catalog launched</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <FiClock className="about-timeline-icon" />
                <div>
                  <h4>2020</h4>
                  <p>Online borrowing system introduced</p>
                </div>
              </div>
              <div className="about-timeline-item">
                <FiClock className="about-timeline-icon" />
                <div>
                  <h4>2024</h4>
                  <p>10,000+ books milestone reached</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <h2 className="about-section-title">Our Core Values</h2>
        <div className="about-values-grid">
          {values.map((value, index) => (
            <div key={index} className="about-value-card">
              <div className="about-value-icon">{value.icon}</div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2 className="about-section-title">Meet Our Team</h2>
        <div className="about-team-grid">
          {team.map((member, index) => (
            <div key={index} className="about-team-card">
              <div className="about-team-image">
                <img src={member.image} alt={member.name} />
              </div>
              <h3 className="about-team-name">{member.name}</h3>
              <p className="about-team-role">{member.role}</p>
              <p className="about-team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Ready to Start Your Reading Journey?</h2>
          <p>Join our community of readers today and explore thousands of books</p>
          <div className="about-cta-buttons">
            <Link to="/register" className="about-btn about-btn-primary">
              Become a Member
            </Link>
            <Link to="/contact" className="about-btn about-btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;