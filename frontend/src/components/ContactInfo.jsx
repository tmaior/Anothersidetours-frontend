const ContactInfo = ({ contactInfo, onContactInfoChange }) => (
  <div className="contact-info">
    <div className="form-group">
      <label htmlFor="name">Name</label>
      <input
        type="text"
        className="form-control"
        id="name"
        name="name"
        value={contactInfo.name}
        onChange={onContactInfoChange}
        placeholder="Full Name"
        aria-describedby="name-help"
      />
      <small id="name-help" className="form-text text-muted">Please enter your full name.</small>
    </div>
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input
        type="email"
        className="form-control"
        id="email"
        name="email"
        value={contactInfo.email}
        onChange={onContactInfoChange}
        placeholder="your@email.com"
        aria-describedby="email-help"
      />
      <small id="email-help" className="form-text text-muted">Please enter a valid email address.</small>
    </div>
  </div>
);
export default ContactInfo;