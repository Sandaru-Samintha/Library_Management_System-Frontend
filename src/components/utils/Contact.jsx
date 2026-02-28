import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { useAlert } from '../../context/AlertContext';
import './Contact.css';

const Contact = () => {
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill in all required fields');
      return;
    }

    setSending(true);

    // Simulate sending message (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      showError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMapPin />,
      title: 'Visit Us',
      details: ['123 Library Street', 'Knowledge City, KC 12345', 'United States']
    },
    {
      icon: <FiPhone />,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 765-4321'],
      action: 'tel:+15551234567'
    },
    {
      icon: <FiMail />,
      title: 'Email Us',
      details: ['info@libraryms.com', 'support@libraryms.com'],
      action: 'mailto:info@libraryms.com'
    },
    {
      icon: <FiClock />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 AM - 8:00 PM', 'Saturday: 10:00 AM - 6:00 PM', 'Sunday: Closed']
    }
  ];

  const faqs = [
    {
      question: 'How do I become a member?',
      answer: 'You can register online through our website or visit the library in person with a valid ID and proof of address.'
    },
    {
      question: 'How long can I borrow books?',
      answer: 'Books can be borrowed for 14 days. You can renew them online if no one else has requested them.'
    },
    {
      question: 'What is the late return fee?',
      answer: 'Late returns are charged at Rs. 10 per day per book. Fines can be paid online or at the library.'
    },
    {
      question: 'Can I reserve books online?',
      answer: 'Yes, members can reserve books through our online catalog. You\'ll be notified when they\'re ready for pickup.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <h1 className="contact-hero-title">Get in Touch</h1>
        <p className="contact-hero-subtitle">
          We'd love to hear from you! Whether you have a question about our services, 
          need assistance, or just want to say hello, we're here to help.
        </p>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="contact-info-icon">{info.icon}</div>
              <h3 className="contact-info-title">{info.title}</h3>
              <div className="contact-info-details">
                {info.details.map((detail, idx) => (
                  <p key={idx}>{detail}</p>
                ))}
              </div>
              {info.action && (
                <a href={info.action} className="contact-info-action">
                  {info.title === 'Call Us' ? 'Call Now' : 'Send Email'}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="contact-main">
        <div className="contact-grid">
          {/* Map */}
          <div className="contact-map">
            <iframe
              title="Library Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-73.98510768458417!3d40.75889697932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1644262070645!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            <h2 className="contact-form-title">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="contact-submit-btn"
                disabled={sending}
              >
                <FiSend /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <h2 className="contact-faq-title">Frequently Asked Questions</h2>
        <div className="contact-faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="contact-faq-item">
              <h3 className="contact-faq-question">{faq.question}</h3>
              <p className="contact-faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Media Section */}
      <section className="contact-social">
        <h2 className="contact-social-title">Connect With Us</h2>
        <div className="contact-social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="contact-social-link facebook">
            <FiFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-social-link twitter">
            <FiTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="contact-social-link instagram">
            <FiInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-social-link linkedin">
            <FiLinkedin />
          </a>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="contact-newsletter">
        <div className="contact-newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates, new arrivals, and library events</p>
          <form className="contact-newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="contact-newsletter-input"
            />
            <button type="submit" className="contact-newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;