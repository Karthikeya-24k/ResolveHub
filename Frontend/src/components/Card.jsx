const Card = ({ children, className = '' }) => (
  <div className={`bg-surface-container-lowest rounded-xl ambient-shadow border border-outline-variant/10 ${className}`}>
    {children}
  </div>
);

export default Card;
