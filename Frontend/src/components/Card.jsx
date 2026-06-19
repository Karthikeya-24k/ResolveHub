const Card = ({ children, className = '' }) => (
  <div className={`panel ${className}`}>
    {children}
  </div>
);

export default Card;
