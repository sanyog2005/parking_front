// src/components/Footer.jsx
import React from 'react';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube,
  FaParking // Added specific parking icon
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md'; // Added for security context
import { Link } from 'react-router-dom';
// import logo from '../../assets/logocar.png'; // Commented out: Replace with your parking logo
import { footerStyles as styles } from '../../assets/dummyStyles';

const Footer = () => {
  return (
    <footer className={styles.container}>
      {/* Decorative top elements */}
      <div className={styles.topElements}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        {/* Kept roadLine as it fits parking themes too */}
        <div className={styles.roadLine} />
      </div>
      
      <div className={styles.innerContainer}>
        <div className={styles.grid}>
          {/* Brand section */}
          <div className={styles.brandSection}>
            <Link to="/" className="flex items-center">
              <div className={styles.logoContainer}>
                {/* Replaced Image with Icon for immediate use. 
                    Uncomment the img tag below if you have a real logo file. */}
                <FaParking className="text-3xl text-yellow-500 mr-2" />
                
                {/* <img
                  src={logo}
                  alt="ParkKing logo"
                  className="h-[1em] w-auto block"
                  style={{ display: 'block', objectFit: 'contain' }}
                /> 
                */}
                <span className={styles.logoText}>PARKKING</span>
              </div>
            </Link>
            <p className={styles.description}>
              Smart, secure, and seamless parking solutions. Reserve your spot instantly and experience hassle-free parking management at your fingertips.
            </p>
            <div className={styles.socialIcons}>
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className={styles.socialIcon}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className={styles.sectionTitle}>
              Quick Links
              <span className={styles.underline} />
            </h3>
            <ul className={styles.linkList}>
              {[
                { name: 'Home', path: '/' },
                { name: 'Find Parking', path: '/locations' }, // Changed from Cars
                { name: 'Pricing', path: '/pricing' },        // Added Pricing
                { name: 'Support', path: '/contact' }         // Changed from Contact Us
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.path}
                    className={styles.linkItem}
                  >
                    <span className={styles.bullet} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className={styles.sectionTitle}>
              Contact Support
              <span className={styles.underline} />
            </h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>New Delhi</span>
              </li>
              <li className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <span>+91 9560231025</span>
              </li>
              <li className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>support@parkking.com</span>
              </li>
            </ul>
            <div className={styles.hoursContainer}>
              <h4 className={styles.hoursTitle}>Parking Support Hours</h4>
              <div className={styles.hoursText}>
                <p>24/7 Emergency Assistance</p>
                <p>Office: Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className={styles.sectionTitle}>
              Stay Updated
              <span className={styles.underline} />
            </h3>
            <p className={styles.newsletterText}>
              Get alerts on new parking zones and monthly pass discounts.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your Email Address"
                className={styles.input}
              />
              <button
                type="submit"
                className={styles.subscribeButton}
              >
                <MdSecurity className="mr-2 text-lg sm:text-xl" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} PARKKING. All rights reserved.</p>
          <p className="mt-3 md:mt-0">
            Designed by <a 
              href="https://hexagondigitalservices.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.designerLink}
            >
              sanyog sharma
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;